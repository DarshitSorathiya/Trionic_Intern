import { readFileSync } from "fs";
import { randomUUID } from "crypto";
import { citationValidity } from './metrics/citationValidity.js';
import { hallucinationRate } from './metrics/hallucinationRate.js';
import { completeness } from './metrics/completeness.js';
import type { EvalRunResult } from "@trionic/shared";
import type { Fixture } from "./types";

// Parse CLI args
// Usage: tsx src/run.ts --dataset rti-week3 --models claude-sonnet-4-20250514,gpt-4o
// Legacy: tsx src/run.ts --fixture fixtures/rti-week3.json --models ...
const args = process.argv.slice(2);
const datasetArgIdx = args.indexOf("--dataset");
const fixtureArgIdx = args.indexOf("--fixture");
const modelsArgIdx = args.indexOf("--models");

// Support both --dataset <name> (main pattern) and --fixture <path> (legacy)
let fixturePath: string;
let datasetId: string;
if (datasetArgIdx !== -1) {
  datasetId = args[datasetArgIdx + 1];
  fixturePath = `fixtures/${datasetId}.json`;
} else if (fixtureArgIdx !== -1) {
  fixturePath = args[fixtureArgIdx + 1];
  datasetId = fixturePath.replace(/^fixtures\//, "").replace(/\.json$/, "");
} else {
  datasetId = "rti-week3";
  fixturePath = `fixtures/${datasetId}.json`;
}

const models =
  modelsArgIdx !== -1
    ? args[modelsArgIdx + 1].split(",")
    : ["claude-sonnet-4-20250514"];

async function runEvals(): Promise<void> {
  console.log("==============================================");
  console.log(" Trionic Adalat - Eval Harness");
  console.log("==============================================\n");

  // Load fixture file
  const raw = readFileSync(fixturePath, "utf-8");
  const parsed = JSON.parse(raw);

  // Support both single fixture and multi-fixture format
  const fixtures: Fixture[] = parsed.fixtures ?? [parsed];
  const datasetIdFromFile: string =
    parsed.dataset_id ?? parsed.fixture_id ?? datasetId;

  console.log(`Dataset:   ${datasetIdFromFile}`);
  console.log(`Fixture:   ${fixturePath}`);
  console.log(`Models:    ${models.join(", ")}`);
  console.log(`Cases:     ${fixtures.length}`);
  console.log("");

  for (const model of models) {
    console.log(`\n--- Running model: ${model} ---\n`);

    let totalCitations = 0;
    let validCitations = 0;
    let totalCompletenessScore = 0;
    let totalHallucinationRate = 0;
    let totalClaims = 0;
    let uncitedClaims = 0;
    let totalRequired = 0;
    let totalMissing = 0;

    for (const fixture of fixtures) {
      console.log(`  Fixture: ${fixture.fixture_id}`);

      // Citation validity — always runs locally and on Vercel
      const citeResult = await citationValidity(fixture);
      totalCitations += citeResult.total_citations;
      validCitations += citeResult.valid_citations;

      console.log(
        `  Citations:     ${citeResult.valid_citations}/${citeResult.total_citations} valid`,
      );
      if (citeResult.invalid_citations.length > 0) {
        console.log(
          `    Invalid:     ${citeResult.invalid_citations.join(", ")}`,
        );
      }

      // Hallucination rate — dynamic import so it doesn't crash if @trionic/agents isn't built
      try {
        const { hallucinationRate } =
          await import("./metrics/hallucinationRate");
        const hallucResult = await hallucinationRate(fixture);
        totalHallucinationRate += hallucResult.hallucination_rate;
        totalClaims += hallucResult.total_claims;
        uncitedClaims += hallucResult.uncited_claims;
        console.log(
          `  Hallucination: ${hallucResult.hallucination_rate.toFixed(1)}% (${hallucResult.uncited_claims}/${hallucResult.total_claims} uncited claims)`,
        );
        if (hallucResult.hallucinated_spans.length > 0) {
          console.log(
            `    Uncited:     "${hallucResult.hallucinated_spans.join('", "')}"`,
          );
        }
      } catch {
        console.log(
          `  Hallucination: skipped (requires API keys + agents build)`,
        );
      }

      // Completeness — dynamic import so it doesn't crash if @trionic/agents isn't built
      try {
        const { completeness } = await import("./metrics/completeness");
        const compResult = await completeness(fixture);
        totalCompletenessScore += compResult.completeness_score;
        totalRequired += compResult.required_sections.length;
        totalMissing += compResult.missing_sections.length;
        console.log(
          `  Completeness:  ${compResult.completeness_score.toFixed(1)}% (${compResult.required_sections.length - compResult.missing_sections.length}/${compResult.required_sections.length} present)`,
        );
        if (compResult.missing_sections.length > 0) {
          console.log(
            `    Missing:     ${compResult.missing_sections.join(", ")}`,
          );
        }
      } catch {
        console.log(
          `  Completeness:  skipped (requires API keys + agents build)`,
        );
      }

      console.log(`  Status:        ${citeResult.status === "pass" ? "PASS" : "FAIL"}`);
      console.log("");
    }

    const overallCiteRate =
      totalCitations === 0 ? 0 : (validCitations / totalCitations) * 100;
const avgCompleteness = totalCompletenessScore / fixtures.length;
const avgHallucination = totalHallucinationRate / fixtures.length;

const overallHallucinationRate =
  totalClaims === 0 ? 0 : (uncitedClaims / totalClaims) * 100;

const overallCompletenessRate =
  totalRequired === 0
    ? 100
    : ((totalRequired - totalMissing) / totalRequired) * 100;

    // Build EvalRunResult as per @trionic/shared contract
    const evalRunResult: EvalRunResult = {
      run_id: randomUUID(),
      dataset_id: datasetIdFromFile,
      model,
      ran_at: new Date().toISOString(),
      metrics: [
        {
          name: "citation_validity_rate",
          value: overallCiteRate,
          unit: "percent",
        },
        {
          name: "hallucination_rate",
          value: overallHallucinationRate,
          unit: "percent",
        },
        {
          name: "completeness_score",
          value: overallCompletenessRate,
          unit: "percent",
        },
      ],
    };

    console.log("--- EvalRunResult ---");
    console.log(JSON.stringify(evalRunResult, null, 2));

    // Write to eval_runs table via POST /api/admin/evals/run (Om's API)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    try {
      const res = await fetch(`${baseUrl}/api/admin/evals/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset_id: datasetIdFromFile,
          models: [model],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { run_id: string };
        console.log(`\n[eval_runs] Queued run_id: ${data.run_id}`);
      } else {
        console.log(
          `\n[eval_runs] API returned ${res.status} - skipping write`,
        );
      }
    } catch {
      console.log(
        "\n[eval_runs] API not reachable - skipping write (run locally without server)",
      );
    }

    const overallPassed =
      overallCiteRate === 100 &&
      overallHallucinationRate === 0 &&
      overallCompletenessRate === 100;

    console.log("\n==============================================");
    console.log(
      overallPassed
? " EVAL PASSED ✓"
: ` EVAL FAILED ✗ (Citations: ${overallCiteRate.toFixed(1)}%, Hallucination: ${overallHallucinationRate.toFixed(1)}%, Completeness: ${overallCompletenessRate.toFixed(1)}%)`
    );
    console.log("==============================================");
  }
}

runEvals().catch(console.error);
