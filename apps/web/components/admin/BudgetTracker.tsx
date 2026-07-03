import type { EvalRunResult } from "@trionic/shared";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface BudgetTrackerProps {
  runs: EvalRunResult[];
  dailyBudgetUsd?: number;
  alertThresholdPct?: number;
}

export function BudgetTracker({
  runs,
  dailyBudgetUsd = 5.0,
  alertThresholdPct = 100,
}: BudgetTrackerProps) {
  // Group runs by date to find today's total cost
  const today = new Date().toISOString().slice(0, 10);
  const todayRuns = runs.filter(
    (run) => run.ran_at.slice(0, 10) === today
  );

  const totalCostToday = todayRuns.reduce((sum, run) => {
    const costMetric = run.metrics.find((m) => m.name === "total_cost_usd");
    return sum + (costMetric?.value ?? 0);
  }, 0);

  const percentUsed = (totalCostToday / dailyBudgetUsd) * 100;
  const alertThresholdUsd = (dailyBudgetUsd * alertThresholdPct) / 100;
  const hasExceededAlert = totalCostToday >= alertThresholdUsd;
  const hasExceededBudget = totalCostToday > dailyBudgetUsd;

  let statusColor = "emerald"; // green - under budget
  let statusText = "On track";

  if (hasExceededBudget) {
    statusColor = "rose"; // red - over budget
    statusText = "Budget exceeded";
  } else if (hasExceededAlert) {
    statusColor = "amber"; // yellow - at alert threshold
    statusText = "Nearing limit";
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-950">
            Daily Budget Tracker
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Cumulative cost across all models today. Daily cap is $5.00 per model.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium border
            ${statusColor === "rose" ? "bg-rose-50 text-rose-800 border-rose-200" : ""}
            ${statusColor === "amber" ? "bg-amber-50 text-amber-800 border-amber-200" : ""}
            ${statusColor === "emerald" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : ""}
          `}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full
              ${statusColor === "rose" ? "bg-rose-600" : ""}
              ${statusColor === "amber" ? "bg-amber-600" : ""}
              ${statusColor === "emerald" ? "bg-emerald-600" : ""}
            `}
          />
          {statusText}
        </div>
      </div>

      <div className="space-y-4">
        {/* Cost display */}
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-slate-600">Current Cost</span>
          <span className="text-3xl font-bold text-slate-950">
            {CURRENCY_FORMATTER.format(totalCostToday)}
          </span>
        </div>

        {/* Daily limit display */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Daily Limit (Per Model)</span>
          <span className="font-medium">{CURRENCY_FORMATTER.format(dailyBudgetUsd)}</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all
                ${hasExceededBudget ? "bg-rose-500" : ""}
                ${!hasExceededBudget && hasExceededAlert ? "bg-amber-500" : ""}
                ${!hasExceededAlert ? "bg-emerald-500" : ""}
              `}
              style={{
                width: `${Math.min(percentUsed, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>$0</span>
            <span className="font-medium">{percentUsed.toFixed(1)}%</span>
            <span>{CURRENCY_FORMATTER.format(dailyBudgetUsd)}</span>
          </div>
        </div>

        {/* Alert message */}
        {hasExceededBudget && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800">
            ⚠️ Daily budget of {CURRENCY_FORMATTER.format(dailyBudgetUsd)} has been exceeded by{" "}
            {CURRENCY_FORMATTER.format(totalCostToday - dailyBudgetUsd)}.
          </div>
        )}

        {!hasExceededBudget && hasExceededAlert && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            ⚠️ Daily budget usage is at {percentUsed.toFixed(1)}% — approaching the{" "}
            {CURRENCY_FORMATTER.format(dailyBudgetUsd)} limit.
          </div>
        )}
      </div>

      {/* Model breakdown for today */}
      {todayRuns.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
            Today's Model Breakdown
          </h3>
          <div className="space-y-2">
            {todayRuns.map((run) => {
              const modelCost = run.metrics.find((m) => m.name === "total_cost_usd")?.value ?? 0;
              const hasExceededModelBudget = modelCost > dailyBudgetUsd;
              const hasExceededModelAlert = modelCost >= (dailyBudgetUsd * alertThresholdPct) / 100;
              return (
                <div key={run.run_id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 flex items-center gap-2">
                    {run.model}
                    {hasExceededModelBudget && (
                      <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        ⚠️ Over Budget
                      </span>
                    )}
                    {!hasExceededModelBudget && hasExceededModelAlert && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        ⚠️ Nearing Cap
                      </span>
                    )}
                  </span>
                  <span className={`font-medium ${hasExceededModelBudget ? "text-rose-600 font-bold" : "text-slate-900"}`}>
                    {CURRENCY_FORMATTER.format(modelCost)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
