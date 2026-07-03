/**
 * smoke.ts
 * Owner: Malay Sheta (Planner agent — Team C Lead)
 *
 * Per-doc-type end-to-end smoke test for runAgentChain.
 *
 * Runs the full agent chain (Classifier → Planner → PageIndex → Drafter →
 * Citator → Reviewer → [Translator]) against a canned intake for the chosen
 * document type and prints every AgentStreamEvent plus the final draft.
 *
 * Usage (after build — see the `smoke` script in package.json):
 *   pnpm --filter @trionic/agents smoke -- --doc-type=nda
 *   pnpm --filter @trionic/agents smoke -- --doc-type=cheque_bounce_notice
 *   pnpm --filter @trionic/agents smoke -- --doc-type=all
 *
 * Requires DEEPSEEK_API_KEY in the environment (loaded from the repo-root .env
 * if present). Supabase / PageIndex credentials are optional — trace
 * persistence and retrieval degrade gracefully when absent.
 */

import { randomUUID } from "crypto";
import { resolve } from "path";
import type { DocumentType, SupportedLanguage } from "@trionic/shared";
import { runAgentChain, type ChainInput } from "./chain.js";
import { DOC_TYPE_PROFILES } from "./planner/doc-type-profiles.js";

// ─── Load .env (best-effort) ──────────────────────────────────────────────────
// dotenv lives at the repo root; agents may not declare it as a dep, so we
// import it defensively and try a couple of likely .env locations.
async function loadEnv(): Promise<void> {
  try {
    const dotenv = await import("dotenv");
    // cwd is usually the agents package dir; the key lives in the repo-root .env
    dotenv.config();
    // Walk up to the repo root (packages/agents -> repo root) for the shared .env.
    dotenv.config({ path: resolve(process.cwd(), "../../.env") });
  } catch {
    // dotenv not resolvable — rely on the ambient environment.
  }
}

// ─── Canned intakes (one per doc type) ────────────────────────────────────────

const CANNED_INTAKES: Record<DocumentType, string> = {
  rti_application:
    "I am a resident of Ward 12 in Ahmedabad. I want to file an RTI to know how much money the municipal corporation spent on repairing roads in my ward between April 2024 and March 2025, and how many complaints they received about potholes.",
  legal_notice:
    "I paid a building contractor ₹3,00,000 as an advance to renovate my flat. He stopped work after two weeks and is not returning my calls. I want to send him a legal notice demanding either completion of the work or a refund.",
  nda:
    "My software startup is about to share its proprietary source code and customer database with an outsourcing vendor for a 6-month engagement. I need a mutual non-disclosure agreement to protect our confidential information and personal data.",
  consumer_complaint:
    "I bought a refrigerator worth ₹45,000 from an online retailer. It arrived with a damaged compressor and stopped cooling within a week. The seller refuses to replace it or refund my money despite repeated emails.",
  cheque_bounce_notice:
    "A business partner issued me a cheque of ₹2,50,000 dated 1 May 2025 towards repayment of a loan. When I deposited it, my bank returned it on 10 May 2025 marked 'funds insufficient'. I want to send a statutory notice under Section 138.",
};

// ─── Arg parsing ──────────────────────────────────────────────────────────────

function parseDocTypeArg(): string {
  const arg = process.argv.find((a) => a.startsWith("--doc-type="));
  if (!arg) return "all";
  return arg.slice("--doc-type=".length).trim();
}

const ALL_DOC_TYPES = Object.keys(DOC_TYPE_PROFILES) as DocumentType[];

function resolveTargets(raw: string): DocumentType[] {
  if (raw === "all" || raw === "") return ALL_DOC_TYPES;
  const normalized = raw.toLowerCase().replace(/-/g, "_");
  if (!ALL_DOC_TYPES.includes(normalized as DocumentType)) {
    console.error(
      `\n[smoke] Unknown --doc-type="${raw}".\n` +
        `        Valid values: ${ALL_DOC_TYPES.join(", ")}, all\n`
    );
    process.exit(1);
  }
  return [normalized as DocumentType];
}

// ─── Single doc-type run ──────────────────────────────────────────────────────

async function runOne(docType: DocumentType, language: SupportedLanguage): Promise<boolean> {
  const input: ChainInput = {
    document_id: randomUUID(),
    intake_text: CANNED_INTAKES[docType],
    target_language: language,
    doc_type: docType,
    session_id: randomUUID(),
  };

  console.log("\n" + "═".repeat(78));
  console.log(`SMOKE: ${docType}  (template: ${DOC_TYPE_PROFILES[docType].template_id})`);
  console.log("═".repeat(78));
  console.log(`intake: ${input.intake_text.slice(0, 90)}…\n`);

  let finalSeen = false;
  let errored: string | null = null;

  try {
    for await (const event of runAgentChain(input)) {
      switch (event.type) {
        case "step.start":
          console.log(`  ▶ ${event.agent} …`);
          break;
        case "step.done":
          console.log(`  ✓ ${event.agent} (${event.duration_ms}ms, ${event.tokens} tok)`);
          break;
        case "step.error":
          errored = `${event.agent}: ${event.message}`;
          console.log(`  ✗ ${event.agent} — ${event.message}`);
          break;
        case "citation.emitted":
          console.log(`    · cite ${event.node_id}`);
          break;
        case "draft.partial":
          // Keep output readable — just note the size.
          console.log(`    · draft chunk (${event.markdown_chunk.length} chars)`);
          break;
        case "draft.final": {
          finalSeen = true;
          const body = event.response.body_markdown;
          console.log(`\n  ── FINAL DRAFT (${body.length} chars, ${event.response.citations.length} citations) ──`);
          console.log(
            body
              .split("\n")
              .map((l) => `  | ${l}`)
              .join("\n")
          );
          break;
        }
      }
    }
  } catch (err) {
    errored = err instanceof Error ? err.message : String(err);
  }

  const ok = finalSeen && !errored;
  console.log(`\n  RESULT: ${ok ? "PASS ✓" : "FAIL ✗"}${errored ? `  (${errored})` : ""}`);
  return ok;
}

// ─── Entry point ──────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await loadEnv();

  if (!process.env.DEEPSEEK_API_KEY) {
    console.error(
      "\n[smoke] DEEPSEEK_API_KEY is not set. Add it to the repo-root .env or export it.\n"
    );
    process.exit(1);
  }

  const langArg = process.argv.find((a) => a.startsWith("--lang="));
  const language = (langArg ? langArg.slice("--lang=".length) : "en") as SupportedLanguage;

  const targets = resolveTargets(parseDocTypeArg());
  console.log(`[smoke] running ${targets.length} doc type(s): ${targets.join(", ")} | language=${language}`);

  const results: Array<{ docType: DocumentType; ok: boolean }> = [];
  for (const docType of targets) {
    const ok = await runOne(docType, language);
    results.push({ docType, ok });
  }

  console.log("\n" + "═".repeat(78));
  console.log("SUMMARY");
  console.log("═".repeat(78));
  for (const r of results) {
    console.log(`  ${r.ok ? "PASS ✓" : "FAIL ✗"}  ${r.docType}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed.\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("[smoke] fatal:", err);
  process.exit(1);
});
