"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "@/i18n/routing";
import type { EvalRunResult } from "@trionic/shared";
import { BudgetTracker } from "@/components/admin/BudgetTracker";
type ClientTraceRow = {
  model?: string | null;
  tokens_in?: number | null;
  tokens_out?: number | null;
  cost_usd?: number | null;
  latency_ms?: number | null;
  timestamp?: string | null;
};


const NUMBER_FORMATTER = new Intl.NumberFormat("en-US");
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function getMetricValue(run: EvalRunResult, metricName: string): number {
  return run.metrics.find((metric) => metric.name === metricName)?.value ?? 0;
}

function formatDate(isoDate: string): string {
  return DATE_FORMATTER.format(new Date(isoDate));
}

export default function AdminEvalsPage() {
  const [runs, setRuns] = useState<EvalRunResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRuns() {
      try {
        setLoading(true);
        setError(null);
        // Prefer querying Supabase directly from the client when public NEXT_PUBLIC_* env vars are present.
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
          try {
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
            const { data: rows, error } = await supabase
              .from("agent_traces")
              .select("model,tokens_in,tokens_out,cost_usd,latency_ms,timestamp")
              .gte("timestamp", cutoff)
              .order("timestamp", { ascending: true });

            if (error || !rows) {
              throw error ?? new Error("Failed to fetch traces from Supabase");
            }

            if (!cancelled) {
              const clientRows = rows as ClientTraceRow[];
              const runs = buildEvalRunsClient(clientRows);
              setRuns(runs);

              // Daily budget tracking and warnings (console/alerting for W3)
              const BUDGET_CAP_USD = 5.0;
              const modelSpendsByBucket: { [key: string]: number } = {};
              clientRows.forEach((row) => {
                if (!row.model || !row.timestamp) return;
                const ts = new Date(row.timestamp);
                if (Number.isNaN(ts.getTime())) return;
                const date = ts.toISOString().slice(0, 10);
                const key = `${date}::${row.model}`;
                modelSpendsByBucket[key] = (modelSpendsByBucket[key] ?? 0) + Number(row.cost_usd ?? 0);
              });

              Object.entries(modelSpendsByBucket).forEach(([key, spend]) => {
                const [date, model] = key.split("::");
                if (spend > BUDGET_CAP_USD) {
                  console.warn(
                    `[BUDGET ALERT] Model ${model} exceeded daily budget on ${date}: $${spend.toFixed(2)} > $${BUDGET_CAP_USD.toFixed(2)}`
                  );
                }
              });
            }
          } catch (e) {
            // If direct Supabase fetch fails, fallback to internal API route.
            console.warn("Direct Supabase query failed, falling back to /api/admin/evals", e);
            const response = await fetch("/api/admin/evals", { cache: "no-store" });
            const payload = (await response.json().catch(() => null)) as
              | { runs?: EvalRunResult[]; error?: string; message?: string }
              | null;

            if (!response.ok) {
              throw new Error(payload?.message ?? payload?.error ?? `Request failed (${response.status})`);
            }

            if (!cancelled) {
              setRuns(Array.isArray(payload?.runs) ? payload.runs : []);
            }
          }
        } else {
          // No public supabase config: use internal API route which uses server-side credentials.
          const response = await fetch("/api/admin/evals", { cache: "no-store" });
          const payload = (await response.json().catch(() => null)) as
            | { runs?: EvalRunResult[]; error?: string; message?: string }
            | null;

          if (!response.ok) {
            throw new Error(payload?.message ?? payload?.error ?? `Request failed (${response.status})`);
          }

          if (!cancelled) {
            setRuns(Array.isArray(payload?.runs) ? payload.runs : []);
          }
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "Failed to load eval dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadRuns();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleRuns = runs
    .filter((run) => selectedModel === "all" || run.model === selectedModel)
    .sort((left, right) => right.ran_at.localeCompare(left.ran_at) || left.model.localeCompare(right.model));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <nav className="mx-auto mb-6 flex w-full max-w-7xl items-center justify-between">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900">Trionic Adalat</div>
        <Link href="/auth/sign-in" className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white">
          Admin login
        </Link>
      </nav>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            Team F · Evals & Telemetry
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Per-LLM Evaluation Dashboard
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                Daily cost and latency for the last 14 days, aggregated from agent traces.
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Model filter
              <select
                className="min-w-48 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={selectedModel}
                onChange={(event) => setSelectedModel(event.target.value)}
              >
                {["all", ...Array.from(new Set(runs.map((r) => r.model))).sort()].map((m) => (
                  <option key={m} value={m}>
                    {m === "all" ? "All models" : m}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500 shadow-sm">
            Loading eval runs…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-800 shadow-sm">
            {error}
          </div>
        ) : (
          <>
            <BudgetTracker
              runs={runs}
              dailyBudgetUsd={5.0}
              alertThresholdPct={100}
            />

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full border-collapse text-left">
                <thead className="bg-slate-950 text-xs uppercase tracking-[0.22em] text-slate-200">
                  <tr>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Model</th>
                    <th className="px-5 py-4 font-medium">Total Calls</th>
                    <th className="px-5 py-4 font-medium">Tokens In</th>
                    <th className="px-5 py-4 font-medium">Tokens Out</th>
                    <th className="px-5 py-4 font-medium">Cost ($)</th>
                    <th className="px-5 py-4 font-medium">P50 Latency (ms)</th>
                    <th className="px-5 py-4 font-medium">P95 Latency (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                  {visibleRuns.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-slate-500" colSpan={8}>
                        No eval runs found for the selected model.
                      </td>
                    </tr>
                  ) : (
                    visibleRuns.map((run) => (
                      <tr key={run.run_id} className="hover:bg-slate-50/80">
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {formatDate(run.ran_at)}
                        </td>
                        <td className="px-5 py-4">{run.model}</td>
                        <td className="px-5 py-4">{NUMBER_FORMATTER.format(getMetricValue(run, "total_calls"))}</td>
                        <td className="px-5 py-4">{NUMBER_FORMATTER.format(getMetricValue(run, "total_tokens_in"))}</td>
                        <td className="px-5 py-4">{NUMBER_FORMATTER.format(getMetricValue(run, "total_tokens_out"))}</td>
                        <td className="px-5 py-4">{CURRENCY_FORMATTER.format(getMetricValue(run, "total_cost_usd"))}</td>
                        <td className="px-5 py-4">{NUMBER_FORMATTER.format(getMetricValue(run, "p50_latency_ms"))}</td>
                        <td className="px-5 py-4">{NUMBER_FORMATTER.format(getMetricValue(run, "p95_latency_ms"))}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </section>
    </main>
  );
}

function buildEvalRunsClient(rows: ClientTraceRow[], now = new Date()): EvalRunResult[] {
  const WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
  const windowStart = new Date(now.getTime() - WINDOW_MS);
  type Bucket = {
    date: string;
    model: string;
    calls: number;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
    latencies: number[];
  };

  const buckets = new Map<string, Bucket>();

  for (const row of rows) {
    if (!row?.model || !row?.timestamp) continue;
    const timestamp = new Date(row.timestamp);
    if (Number.isNaN(timestamp.getTime()) || timestamp < windowStart) continue;

    const date = timestamp.toISOString().slice(0, 10);
    const key = `${date}::${row.model}`;
    const bucket = (buckets.get(key) ?? {
      date,
      model: row.model,
      calls: 0,
      tokensIn: 0,
      tokensOut: 0,
      costUsd: 0,
      latencies: [],
    }) as Bucket;

    bucket.calls += 1;
    bucket.tokensIn += Number(row.tokens_in ?? 0);
    bucket.tokensOut += Number(row.tokens_out ?? 0);
    bucket.costUsd += Number(row.cost_usd ?? 0);
    bucket.latencies.push(Number(row.latency_ms ?? 0));
    buckets.set(key, bucket);
  }

  function percentile(values: number[], q: number) {
    if (values.length === 0) return 0;
    const s = [...values].sort((a, b) => a - b);
    const pos = (s.length - 1) * q;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    if (lo === hi) return s[lo];
    const frac = pos - lo;
    return s[lo] + (s[hi] - s[lo]) * frac;
  }

  return [...buckets.values()]
    .sort((l, r) => r.date.localeCompare(l.date) || l.model.localeCompare(r.model))
    .map((bucket) => ({
      run_id: `run-${bucket.date}-${bucket.model}`,
      dataset_id: "prod-traces",
      model: bucket.model,
      ran_at: new Date(`${bucket.date}T00:00:00.000Z`).toISOString(),
      metrics: [
        { name: "total_calls", value: bucket.calls, unit: "calls" },
        { name: "total_tokens_in", value: bucket.tokensIn, unit: "tokens" },
        { name: "total_tokens_out", value: bucket.tokensOut, unit: "tokens" },
        { name: "total_cost_usd", value: bucket.costUsd, unit: "usd" },
        { name: "p50_latency_ms", value: percentile(bucket.latencies, 0.5), unit: "ms" },
        { name: "p95_latency_ms", value: percentile(bucket.latencies, 0.95), unit: "ms" },
      ],
    } as EvalRunResult));
}
