"use strict";
/**
 * router/costCapTracker.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Enforces a daily cost cap (default $5.00/day) on DeepSeek calls.
 * Persists cumulative daily cost to a local gitignored file to survive server restarts,
 * and gracefully falls back to in-memory tracking if file I/O is restricted.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostCapTracker = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class CostCapTracker {
    static CAP_FILE = path_1.default.join(process.cwd(), ".deepseek-cost.json");
    static limit = 10.0; // Default: $10.00 USD/day (raised for Week 4)
    static memoryCost = 0;
    static memoryDate = new Date().toISOString().split("T")[0];
    /**
     * Update the daily cost cap (e.g. raise if hit during W3)
     */
    static setLimit(newLimit) {
        this.limit = newLimit;
    }
    /**
     * Get the current daily cost cap limit
     */
    static getLimit() {
        return this.limit;
    }
    /**
     * Reset memory tracker if the date has changed.
     */
    static checkMemoryDateReset() {
        const today = new Date().toISOString().split("T")[0];
        if (this.memoryDate !== today) {
            this.memoryCost = 0;
            this.memoryDate = today;
        }
    }
    /**
     * Get the recorded daily cost for today (in USD).
     */
    static getDailyCost() {
        this.checkMemoryDateReset();
        const today = new Date().toISOString().split("T")[0];
        try {
            if (fs_1.default.existsSync(this.CAP_FILE)) {
                const content = fs_1.default.readFileSync(this.CAP_FILE, "utf-8");
                const data = JSON.parse(content);
                if (data.date === today) {
                    return data.cost;
                }
            }
        }
        catch (err) {
            // Gracefully fall back to in-memory tracking in read-only filesystems
        }
        return this.memoryCost;
    }
    /**
     * Verify that the current usage is under the cost cap limit.
     * Throws an error if the daily limit is exceeded.
     */
    static verifyUnderCap() {
        const currentCost = this.getDailyCost();
        if (currentCost >= this.limit) {
            throw new Error(`[CostCapTracker] DeepSeek daily cost cap of $${this.limit.toFixed(2)} has been exceeded (Current today: $${currentCost.toFixed(6)}).`);
        }
    }
    /**
     * Register a new transaction cost.
     */
    static addCost(cost) {
        this.checkMemoryDateReset();
        const today = new Date().toISOString().split("T")[0];
        const newCost = this.getDailyCost() + cost;
        this.memoryCost = newCost;
        try {
            fs_1.default.writeFileSync(this.CAP_FILE, JSON.stringify({ date: today, cost: newCost }), "utf-8");
        }
        catch (err) {
            // Gracefully continue with in-memory tracking in read-only filesystems
        }
    }
}
exports.CostCapTracker = CostCapTracker;
//# sourceMappingURL=costCapTracker.js.map