import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildEvalRuns,
  handleAdminEvals,
  isAdminUser,
  percentile,
  handleAdminEvalRun,
} from "../../../apps/web/app/api/admin/evals/lib";

type TraceRow = {
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  latency_ms: number;
  timestamp: string;
};

type AdminUser = {
  id?: string;
  user_metadata?: { role?: string | null } | null;
  app_metadata?: { role?: string | null } | null;
} | null;

function createSupabaseMock({
  user,
  traces,
  queryError,
  insertedRunId,
}: {
  user: AdminUser;
  traces: TraceRow[];
  queryError?: string | null;
  insertedRunId?: string;
}) {
  // The mock drives admin authorisation from the same role claim the test
  // sets on `user.user_metadata.role`. In production this role is now read
  // from public.users via isAdminViaDb, so the mock's `from('users')`
  // branch returns that role to match the production flow.
  const roleFromUser =
    user?.user_metadata?.role ?? user?.app_metadata?.role ?? null;

  return {
    auth: {
      async getUser() {
        return {
          data: { user },
          error: null,
        };
      },
    },
    from(table: string) {
      if (table === "users") {
        return {
          select() {
            return {
              eq() {
                return {
                  async single() {
                    return {
                      data: { role: roleFromUser },
                      error: null,
                    };
                  },
                };
              },
            };
          },
        };
      }
      if (table === "agent_traces") {
        return {
          select() {
            return {
              gte() {
                return {
                  async order() {
                    return {
                      data: traces,
                      error: queryError ? { message: queryError } : null,
                    };
                  },
                };
              },
            };
          },
        };
      }
      // eval_runs
      return {
        insert() {
          return {
            select() {
              return {
                async single() {
                  return {
                    data: insertedRunId ? { id: insertedRunId } : null,
                    error: insertedRunId ? null : { message: "insert failed" },
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

test("admin eval endpoint returns EvalRunResult shape", async () => {
  const now = new Date("2026-05-25T12:00:00.000Z");
  const response = await handleAdminEvals(
    createSupabaseMock({
      user: { id: "test-user-admin", user_metadata: { role: "admin" } },
      traces: [
        {
          model: "gpt-4",
          tokens_in: 100,
          tokens_out: 50,
          cost_usd: 0.25,
          latency_ms: 120,
          timestamp: "2026-05-25T08:00:00.000Z",
        },
      ],
    }),
    now,
  );

  assert.equal(response.status, 200);

  const payload = await readJson(response);
  assert.ok(Array.isArray(payload.runs));
  assert.equal((payload.runs as Array<Record<string, unknown>>).length, 1);
  assert.deepEqual((payload.runs as Array<Record<string, unknown>>)[0].dataset_id, "prod-traces");
});

test("only admin users can access the endpoint", async () => {
  const response = await handleAdminEvals(
    createSupabaseMock({
      user: { id: "test-user-member", user_metadata: { role: "member" } },
      traces: [],
    }),
    new Date("2026-05-25T12:00:00.000Z"),
  );

  assert.equal(response.status, 403);
  const payload = await readJson(response);
  assert.equal(payload.error, "forbidden");
});

test("returns data only from the last 14 days", () => {
  const now = new Date("2026-05-25T12:00:00.000Z");
  const runs = buildEvalRuns(
    [
      {
        model: "gpt-4",
        tokens_in: 100,
        tokens_out: 50,
        cost_usd: 0.25,
        latency_ms: 120,
        timestamp: "2026-05-10T08:00:00.000Z",
      },
      {
        model: "gpt-4",
        tokens_in: 200,
        tokens_out: 75,
        cost_usd: 0.5,
        latency_ms: 180,
        timestamp: "2026-05-20T08:00:00.000Z",
      },
    ],
    now,
  );

  assert.equal(runs.length, 1);
  assert.equal(runs[0].run_id, "run-2026-05-20-gpt-4");
});

test("metrics are aggregated correctly", async () => {
  const now = new Date("2026-05-25T12:00:00.000Z");
  const response = await handleAdminEvals(
    createSupabaseMock({
      user: { id: "test-user-admin", user_metadata: { role: "admin" } },
      traces: [
        {
          model: "claude-opus",
          tokens_in: 100,
          tokens_out: 30,
          cost_usd: 0.4,
          latency_ms: 100,
          timestamp: "2026-05-25T08:00:00.000Z",
        },
        {
          model: "claude-opus",
          tokens_in: 200,
          tokens_out: 20,
          cost_usd: 0.6,
          latency_ms: 200,
          timestamp: "2026-05-25T09:00:00.000Z",
        },
        {
          model: "claude-opus",
          tokens_in: 50,
          tokens_out: 10,
          cost_usd: 0.1,
          latency_ms: 500,
          timestamp: "2026-05-25T10:00:00.000Z",
        },
      ],
    }),
    now,
  );

  const payload = (await response.json()) as { runs: Array<{ metrics: Array<{ name: string; value: number }> }> };
  const run = payload.runs[0];

  assert.equal(run.metrics.find((metric) => metric.name === "total_calls")?.value, 3);
  assert.equal(run.metrics.find((metric) => metric.name === "total_tokens_in")?.value, 350);
  assert.equal(run.metrics.find((metric) => metric.name === "total_tokens_out")?.value, 60);
  assert.equal(run.metrics.find((metric) => metric.name === "total_cost_usd")?.value, 1.1);
  assert.equal(run.metrics.find((metric) => metric.name === "p50_latency_ms")?.value, 200);
  assert.equal(run.metrics.find((metric) => metric.name === "p95_latency_ms")?.value, 470);
});

test("empty results are handled gracefully", async () => {
  const response = await handleAdminEvals(
    createSupabaseMock({
      user: { id: "test-user-admin", user_metadata: { role: "admin" } },
      traces: [],
    }),
    new Date("2026-05-25T12:00:00.000Z"),
  );

  assert.equal(response.status, 200);
  const payload = (await response.json()) as { runs: unknown[] };
  assert.deepEqual(payload.runs, []);
});

test("percentile and admin role helpers work as expected", () => {
  assert.equal(percentile([10, 20, 30, 40], 0.5), 25);
  assert.equal(isAdminUser({ user_metadata: { role: "admin" } }), true);
  assert.equal(isAdminUser({ app_metadata: { role: "admin" } }), true);
  assert.equal(isAdminUser({ user_metadata: { role: "member" } }), false);
});

test("admin eval run endpoint queues a run and returns run_id", async () => {
  const response = await handleAdminEvalRun(
    createSupabaseMock({
      user: { id: "user-1", user_metadata: { role: "admin" } },
      traces: [],
      insertedRunId: "run-123",
    }),
    {
      dataset_id: "prod-traces",
      models: ["claude-opus", "gpt-4"],
    },
    new Date("2026-05-25T12:00:00.000Z"),
  );

  assert.equal(response.status, 202);
  const payload = (await response.json()) as { run_id: string };
  assert.equal(payload.run_id, "run-123");
});

test("admin eval run endpoint rejects invalid payloads", async () => {
  const response = await handleAdminEvalRun(
    createSupabaseMock({
      user: { id: "user-1", user_metadata: { role: "admin" } },
      traces: [],
      insertedRunId: "run-123",
    }),
    { dataset_id: "prod-traces", models: [] },
    new Date("2026-05-25T12:00:00.000Z"),
  );

  assert.equal(response.status, 400);
});
