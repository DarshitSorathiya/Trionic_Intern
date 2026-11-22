/**
 * router/costCapTracker.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Enforces a daily cost cap (default $5.00/day) on DeepSeek calls.
 * Persists cumulative daily cost to a local gitignored file to survive server restarts,
 * and gracefully falls back to in-memory tracking if file I/O is restricted.
 */
export declare class CostCapTracker {
    private static readonly CAP_FILE;
    private static limit;
    private static memoryCost;
    private static memoryDate;
    /**
     * Update the daily cost cap (e.g. raise if hit during W3)
     */
    static setLimit(newLimit: number): void;
    /**
     * Get the current daily cost cap limit
     */
    static getLimit(): number;
    /**
     * Reset memory tracker if the date has changed.
     */
    private static checkMemoryDateReset;
    /**
     * Get the recorded daily cost for today (in USD).
     */
    static getDailyCost(): number;
    /**
     * Verify that the current usage is under the cost cap limit.
     * Throws an error if the daily limit is exceeded.
     */
    static verifyUnderCap(): void;
    /**
     * Register a new transaction cost.
     */
    static addCost(cost: number): void;
}
//# sourceMappingURL=costCapTracker.d.ts.map