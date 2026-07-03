"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";

type CitationEvalRun = {
  id: string;
  run_name: string;
  eval_type: string;
  config: {
    dataset_id: string;
    models: string[];
  };
  results: {
    citation_validity_rate: number;
    total_citations: number;
    valid_citations: number;
    invalid_citations: string[];
  } | null;
  score: number | null;
  status: string;
  started_at: string;
  finished_at: string | null;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(isoDate: string): string {
  return DATE_FORMATTER.format(new Date(isoDate));
}

function getStatusColor(status: string): string {
  switch (status) {
    case "passed":
      return "text-emerald-600 bg-emerald-50";
    case "failed":
      return "text-rose-600 bg-rose-50";
    case "running":
      return "text-amber-600 bg-amber-50";
    default:
      return "text-slate-600 bg-slate-50";
  }
}

export default function CitationValidityPage() {
  const [runs, setRuns] = useState<CitationEvalRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRuns() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/admin/evals", { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            payload?.message ??
              payload?.error ??
              `Request failed (${response.status})`,
          );
        }

        if (!cancelled) {
          const citationRuns = (payload?.runs ?? []).filter(
            (run: CitationEvalRun) =>
              run.eval_type === "citation_accuracy" ||
              run.config?.dataset_id?.includes("rti"),
          );
          setRuns(citationRuns);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load citation validity runs",
          );
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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <nav className="mx-auto mb-6 flex w-full max-w-7xl items-center justify-between">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900">
          Trionic Adalat
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/evals"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            Per-LLM Dashboard
          </Link>
          <Link
            href="/auth/sign-in"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Admin login
          </Link>
        </div>
      </nav>

      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
            Team F · Evals & Telemetry
          </p>
          <div className="mt-3 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Citation Validity Dashboard
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Citation correctness eval results — tracks how accurately the AI
              cites real RTI Act sections vs hallucinated ones.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500 shadow-sm">
            Loading citation validity runs...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-800 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[960px] w-full border-collapse text-left">
                <thead className="bg-slate-950 text-xs uppercase tracking-[0.22em] text-slate-200">
                  <tr>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Dataset</th>
                    <th className="px-5 py-4 font-medium">Model</th>
                    <th className="px-5 py-4 font-medium">
                      Citation Validity (%)
                    </th>
                    <th className="px-5 py-4 font-medium">Valid / Total</th>
                    <th className="px-5 py-4 font-medium">Invalid Citations</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                  {runs.length === 0 ? (
                    <tr>
                      <td className="px-5 py-8 text-slate-500" colSpan={7}>
                        No citation validity runs found. Run the eval harness to
                        populate results.
                      </td>
                    </tr>
                  ) : (
                    runs.map((run) => (
                      <tr key={run.id} className="hover:bg-slate-50/80">
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {formatDate(run.started_at)}
                        </td>
                        <td className="px-5 py-4">
                          {run.config?.dataset_id ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          {run.config?.models?.[0] ?? "—"}
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {run.results?.citation_validity_rate != null
                            ? `${run.results.citation_validity_rate.toFixed(1)}%`
                            : run.score != null
                              ? `${(run.score * 100).toFixed(1)}%`
                              : "—"}
                        </td>
                        <td className="px-5 py-4">
                          {run.results
                            ? `${run.results.valid_citations} / ${run.results.total_citations}`
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-rose-600">
                          {run.results?.invalid_citations?.length
                            ? run.results.invalid_citations.join(", ")
                            : "None"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(run.status)}`}
                          >
                            {run.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
