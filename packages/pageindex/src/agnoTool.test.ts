import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMockState = vi.hoisted(() => ({ client: {} as Record<string, unknown> }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => supabaseMockState.client),
}));

vi.mock("./query.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./query.js")>();
  return {
    ...actual,
    search: vi.fn(),
  };
});

import { PageIndex, resolvePageIndexSupabaseCredentials } from "./agnoTool.js";
import { search as localSearch } from "./query.js";

function makePageIndex(database: Record<string, unknown>) {
  supabaseMockState.client = database;
  const pageIndex = new PageIndex(
    "https://example.supabase.co",
    "test-key",
    "dummy-key"
  );
  return pageIndex;
}

describe("PageIndex live search scoping", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the Act scope when no live snapshot exists", async () => {
    vi.mocked(localSearch).mockResolvedValueOnce([]);
    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    const pageIndex = makePageIndex({ from: vi.fn(() => queryBuilder) });

    await pageIndex.search({
      query: "consumer complaint filing",
      scope: "CPA-2019/CH-IV",
      top_k: 3,
    });

    expect(vi.mocked(localSearch)).toHaveBeenCalledWith(
      "consumer complaint filing",
      { act_code: "CPA-2019" },
      3
    );
    expect(queryBuilder.eq).toHaveBeenCalledWith("act_code", "CPA-2019");
  });

  it("uses and caches the latest snapshot independently for each Act", async () => {
    const actByQuery = new Map<object, string>();
    const from = vi.fn(() => {
      const builder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn((column: string, value: string) => {
          if (column === "act_code") actByQuery.set(builder, value);
          return builder;
        }),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn(async () => ({
          data: { id: `${actByQuery.get(builder)}-snapshot` },
          error: null,
        })),
      };
      return builder;
    });
    const database = {
      from,
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    const pageIndex = makePageIndex(database);

    await pageIndex.search({ query: "contract terms", scope: "contract-act:" });
    await pageIndex.search({ query: "consumer complaint", scope: "CPA-2019" });

    expect(from).toHaveBeenCalledTimes(2);
    expect(vi.mocked(localSearch)).not.toHaveBeenCalled();
    expect(database.rpc).toHaveBeenCalledTimes(2);
    expect(vi.mocked(database.rpc).mock.calls.map(([name, args]) => [name, args.p_snapshot_id])).toEqual([
      ["pageindex_search", "ICA-1872-snapshot"],
      ["pageindex_search", "CPA-2019-snapshot"],
    ]);
  });

  it("does not fall back globally for an unknown scope", async () => {
    const from = vi.fn();
    const pageIndex = makePageIndex({ from });

    await expect(
      pageIndex.search({ query: "some legal query", scope: "UNKNOWN-ACT" })
    ).resolves.toEqual([]);

    expect(from).not.toHaveBeenCalled();
    expect(vi.mocked(localSearch)).not.toHaveBeenCalled();
  });
});

describe("resolvePageIndexSupabaseCredentials", () => {
  it("skips blank server-only values and falls back to the public project credentials", () => {
    expect(resolvePageIndexSupabaseCredentials({
      SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_URL: " https://example.supabase.co ",
      SUPABASE_SERVICE_KEY: "",
      SUPABASE_SERVICE_ROLE_KEY: "   ",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: " publishable-key ",
    })).toEqual({
      supabaseUrl: "https://example.supabase.co",
      supabaseKey: "publishable-key",
    });
  });
});