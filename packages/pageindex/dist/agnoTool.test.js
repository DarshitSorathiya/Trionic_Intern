"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supabaseMockState = vitest_1.vi.hoisted(() => ({ client: {} }));
vitest_1.vi.mock("@supabase/supabase-js", () => ({
    createClient: vitest_1.vi.fn(() => supabaseMockState.client),
}));
vitest_1.vi.mock("./query.js", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        search: vitest_1.vi.fn(),
    };
});
const agnoTool_js_1 = require("./agnoTool.js");
const query_js_1 = require("./query.js");
function makePageIndex(database) {
    supabaseMockState.client = database;
    const pageIndex = new agnoTool_js_1.PageIndex("https://example.supabase.co", "test-key", "dummy-key");
    return pageIndex;
}
(0, vitest_1.describe)("PageIndex live search scoping", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)("keeps the Act scope when no live snapshot exists", async () => {
        vitest_1.vi.mocked(query_js_1.search).mockResolvedValueOnce([]);
        const queryBuilder = {
            select: vitest_1.vi.fn().mockReturnThis(),
            eq: vitest_1.vi.fn().mockReturnThis(),
            order: vitest_1.vi.fn().mockReturnThis(),
            limit: vitest_1.vi.fn().mockReturnThis(),
            maybeSingle: vitest_1.vi.fn().mockResolvedValue({ data: null, error: null }),
        };
        const pageIndex = makePageIndex({ from: vitest_1.vi.fn(() => queryBuilder) });
        await pageIndex.search({
            query: "consumer complaint filing",
            scope: "CPA-2019/CH-IV",
            top_k: 3,
        });
        (0, vitest_1.expect)(vitest_1.vi.mocked(query_js_1.search)).toHaveBeenCalledWith("consumer complaint filing", { act_code: "CPA-2019" }, 3);
        (0, vitest_1.expect)(queryBuilder.eq).toHaveBeenCalledWith("act_code", "CPA-2019");
    });
    (0, vitest_1.it)("uses and caches the latest snapshot independently for each Act", async () => {
        const actByQuery = new Map();
        const from = vitest_1.vi.fn(() => {
            const builder = {
                select: vitest_1.vi.fn().mockReturnThis(),
                eq: vitest_1.vi.fn((column, value) => {
                    if (column === "act_code")
                        actByQuery.set(builder, value);
                    return builder;
                }),
                order: vitest_1.vi.fn().mockReturnThis(),
                limit: vitest_1.vi.fn().mockReturnThis(),
                maybeSingle: vitest_1.vi.fn(async () => ({
                    data: { id: `${actByQuery.get(builder)}-snapshot` },
                    error: null,
                })),
            };
            return builder;
        });
        const database = {
            from,
            rpc: vitest_1.vi.fn().mockResolvedValue({ data: [], error: null }),
        };
        const pageIndex = makePageIndex(database);
        await pageIndex.search({ query: "contract terms", scope: "contract-act:" });
        await pageIndex.search({ query: "consumer complaint", scope: "CPA-2019" });
        (0, vitest_1.expect)(from).toHaveBeenCalledTimes(2);
        (0, vitest_1.expect)(vitest_1.vi.mocked(query_js_1.search)).not.toHaveBeenCalled();
        (0, vitest_1.expect)(database.rpc).toHaveBeenCalledTimes(2);
        (0, vitest_1.expect)(vitest_1.vi.mocked(database.rpc).mock.calls.map(([name, args]) => [name, args.p_snapshot_id])).toEqual([
            ["pageindex_search", "ICA-1872-snapshot"],
            ["pageindex_search", "CPA-2019-snapshot"],
        ]);
    });
    (0, vitest_1.it)("does not fall back globally for an unknown scope", async () => {
        const from = vitest_1.vi.fn();
        const pageIndex = makePageIndex({ from });
        await (0, vitest_1.expect)(pageIndex.search({ query: "some legal query", scope: "UNKNOWN-ACT" })).resolves.toEqual([]);
        (0, vitest_1.expect)(from).not.toHaveBeenCalled();
        (0, vitest_1.expect)(vitest_1.vi.mocked(query_js_1.search)).not.toHaveBeenCalled();
    });
});
(0, vitest_1.describe)("resolvePageIndexSupabaseCredentials", () => {
    (0, vitest_1.it)("skips blank server-only values and falls back to the public project credentials", () => {
        (0, vitest_1.expect)((0, agnoTool_js_1.resolvePageIndexSupabaseCredentials)({
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
//# sourceMappingURL=agnoTool.test.js.map