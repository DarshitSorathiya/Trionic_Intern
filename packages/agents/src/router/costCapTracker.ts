/**
 * router/costCapTracker.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Enforces a daily cost cap (default $5.00/day) on DeepSeek calls.
 * Persists cumulative daily cost to a local gitignored file to survive server restarts,
 * and gracefully falls back to in-memory tracking if file I/O is restricted.
 */

import fs from "fs";
import path from "path";

export class CostCapTracker {
  private static readonly CAP_FILE = path.join(process.cwd(), ".deepseek-cost.json");
  private static limit = 10.0; // Default: $10.00 USD/day (raised for Week 4)
  private static memoryCost = 0;
  private static memoryDate = new Date().toISOString().split("T")[0];

  /**
   * Update the daily cost cap (e.g. raise if hit during W3)
   */
  static setLimit(newLimit: number): void {
    this.limit = newLimit;
  }

  /**
   * Get the current daily cost cap limit
   */
  static getLimit(): number {
    return this.limit;
  }

  /**
   * Reset memory tracker if the date has changed.
   */
  private static checkMemoryDateReset(): void {
    const today = new Date().toISOString().split("T")[0];
    if (this.memoryDate !== today) {
      this.memoryCost = 0;
      this.memoryDate = today;
    }
  }

  /**
   * Get the recorded daily cost for today (in USD).
   */
  static getDailyCost(): number {
    this.checkMemoryDateReset();
    const today = new Date().toISOString().split("T")[0];

    try {
      if (fs.existsSync(this.CAP_FILE)) {
        const content = fs.readFileSync(this.CAP_FILE, "utf-8");
        const data = JSON.parse(content);
        if (data.date === today) {
          return data.cost;
        }
      }
    } catch (err) {
      // Gracefully fall back to in-memory tracking in read-only filesystems
    }

    return this.memoryCost;
  }

  /**
   * Verify that the current usage is under the cost cap limit.
   * Throws an error if the daily limit is exceeded.
   */
  static verifyUnderCap(): void {
    const currentCost = this.getDailyCost();
    if (currentCost >= this.limit) {
      throw new Error(
        `[CostCapTracker] DeepSeek daily cost cap of $${this.limit.toFixed(2)} has been exceeded (Current today: $${currentCost.toFixed(6)}).`
      );
    }
  }

  /**
   * Register a new transaction cost.
   */
  static addCost(cost: number): void {
    this.checkMemoryDateReset();
    const today = new Date().toISOString().split("T")[0];
    const newCost = this.getDailyCost() + cost;

    this.memoryCost = newCost;

    try {
      fs.writeFileSync(
        this.CAP_FILE,
        JSON.stringify({ date: today, cost: newCost }),
        "utf-8"
      );
    } catch (err) {
      // Gracefully continue with in-memory tracking in read-only filesystems
    }
  }
}
