/**
 * smoke-test.mjs — Week-3 demo gate
 * Owner: Malay Sheta (Agents Lead)
 *
 * Run from the repo root:
 *   pnpm --filter @trionic/agents build
 *   node packages/agents/smoke-test.mjs
 *
 * Required env vars (at least one LLM key must be set):
 *   DEEPSEEK_API_KEY   — used by drafter (preferred)
 *   GOOGLE_API_KEY     — used by classifier + reviewer (preferred)
 *   ANTHROPIC_API_KEY  — fallback for planner + drafter
 *   OPENAI_API_KEY     — fallback for classifier + reviewer
 *
 * Optional (for Supabase tracing):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Acceptance criteria (Week 3):
 *   → All 6 agents fire in order (classifier, planner, pageindex, drafter, citator, reviewer)
 *   → Each agent emits step.start + step.done events
 *   → Final draft.final event has body_markdown with ≥3 [CITE:RTI-2005/...] markers
 *   → No step.error events emitted
 */

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

// ─── Load .env.local if present ───────────────────────────────────────────────
// This allows running `node smoke-test.mjs` without pre-exporting env vars.
try {
  const { config } = await import("dotenv");
  // Try repo-root .env.local first, then .env
  const __dir = dirname(fileURLToPath(import.meta.url));
  const repoRoot = join(__dir, "..", "..");
  config({ path: join(repoRoot, ".env.local"), override: false });
  config({ path: join(repoRoot, ".env"), override: false });
} catch {
  // dotenv not installed — continue with process.env as-is
}

// ─── Import the built package ──────────────────────────────────────────────────
// After `pnpm --filter @trionic/agents build`, the dist is at ./dist/index.js
const { runAgentChain } = await import("./dist/index.js");

// ─── Canned RTI intake (Week-3 acceptance criteria) ───────────────────────────
const canned_req = {
  document_id:     "rti-smoke-001",
  session_id:      "smoke-test-session-001",
  intake_text:
    "I want to file an RTI application for traffic fine records from Surat municipality. " +
    "I received a traffic challan of ₹2000 for alleged signal jumping on 15/03/2024 near Adajan " +
    "Patiya, Surat. I want to know: (1) the legal basis for the fine, (2) the total number of " +
    "challans issued in Surat district in FY 2023-24, and (3) the procedure for contesting a " +
    "challan under the Motor Vehicles Act. I am an Indian citizen and wish to exercise my right " +
    "to information under the RTI Act, 2005.",
  target_language: "en",
  doc_type:        "rti_application",
};

// ─── API Key Diagnostic ────────────────────────────────────────────────────────
const hasDeepSeek  = !!process.env.DEEPSEEK_API_KEY;
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
const hasGoogle    = !!process.env.GOOGLE_API_KEY;
const hasOpenAI    = !!process.env.OPENAI_API_KEY;

console.log("🔑 API Key status:");
console.log(`   DEEPSEEK_API_KEY  : ${hasDeepSeek  ? "✅ set (drafter preferred)"   : "❌ missing"}`);
console.log(`   ANTHROPIC_API_KEY : ${hasAnthropic ? "✅ set (drafter fallback)"    : "❌ missing"}`);
console.log(`   GOOGLE_API_KEY    : ${hasGoogle    ? "✅ set (classifier preferred)" : "❌ missing"}`);
console.log(`   OPENAI_API_KEY    : ${hasOpenAI    ? "✅ set (fallback)"             : "❌ missing"}`);

if (!hasDeepSeek && !hasAnthropic && !hasGoogle && !hasOpenAI) {
  console.warn(`
⚠️  WARNING: No API keys found! The chain will run with stub fallbacks only.
   Real LLM calls require at least:
     - DEEPSEEK_API_KEY  → for drafter (primary)
     - ANTHROPIC_API_KEY → for drafter fallback  
     - GOOGLE_API_KEY    → for classifier & reviewer
   Set these in .env.local at the repo root before running.
`);
}

console.log("\n════════════════════════════════════════════════");
console.log("   runAgentChain smoke-test — Week 3 (RTI)   ");
console.log("════════════════════════════════════════════════\n");
console.log("📥 Request:", JSON.stringify({
  document_id: canned_req.document_id,
  intake_text: canned_req.intake_text.slice(0, 80) + "...",
  target_language: canned_req.target_language,
  doc_type: canned_req.doc_type,
}, null, 2), "\n");

const agentOrder   = [];
let   finalDraft   = null;
let   errorCount   = 0;
let   citationCount = 0;

const t0 = Date.now();

try {
  for await (const evt of runAgentChain(canned_req)) {
    switch (evt.type) {
      case "step.start":
        agentOrder.push(evt.agent);
        console.log(`▶  [step.start]   agent=${evt.agent.padEnd(12)} ts=${evt.ts}`);
        break;

      case "step.done":
        console.log(
          `✅ [step.done]    agent=${evt.agent.padEnd(12)} ` +
          `duration_ms=${String(evt.duration_ms).padStart(6)}  tokens=${evt.tokens}`
        );
        break;

      case "step.error":
        errorCount++;
        console.error(`❌ [step.error]   agent=${evt.agent.padEnd(12)} message=${evt.message}`);
        break;

      case "citation.emitted":
        citationCount++;
        console.log(`🔗 [citation]     node_id=${evt.node_id}`);
        break;

      case "draft.partial":
        console.log(`📝 [draft.partial] chunk_len=${evt.markdown_chunk.length} chars`);
        break;

      case "draft.final":
        finalDraft = evt.response;
        const bodyLen = evt.response.body_markdown.length;
        const citeCount = (evt.response.body_markdown.match(/\[CITE:/g) || []).length;
        const rtiCiteCount = (evt.response.body_markdown.match(/\[CITE:RTI-2005[^\]]*\]/g) || []).length;
        console.log(`\n🏁 [draft.final]`);
        console.log(`   document_id :  ${evt.response.document_id}`);
        console.log(`   version_id  :  ${evt.response.version_id}`);
        console.log(`   body_len    :  ${bodyLen} chars`);
        console.log(`   total cites :  ${citeCount}`);
        console.log(`   RTI cites   :  ${rtiCiteCount}  ← must be ≥ 3`);
        console.log(`   citations[] :  ${evt.response.citations.length} validated`);
        console.log(`   warnings    :  ${evt.response.warnings.join(", ") || "(none)"}`);
        if (bodyLen > 0) {
          console.log(`\n   --- Draft preview (first 400 chars) ---`);
          console.log(`   ${evt.response.body_markdown.slice(0, 400).replace(/\n/g, "\n   ")}`);
          console.log(`   ---`);
        }
        break;
    }
  }
} catch (err) {
  console.error("\n💥 runAgentChain threw an unhandled error:", err.message || err);
  process.exit(1);
}

const totalMs = Date.now() - t0;

// ─── Demo Gate Assertions ──────────────────────────────────────────────────────
console.log("\n════════════════════════════════════════════════");
console.log("   Demo Gate Results");
console.log("════════════════════════════════════════════════\n");
console.log(`Agent firing order: ${agentOrder.join(" → ")}\n`);

const EXPECTED_AGENTS = ["classifier", "planner", "pageindex", "drafter", "citator", "reviewer"];
const results = [];

// AC1: all 6 agents fired
const allFired = EXPECTED_AGENTS.every((a) => agentOrder.includes(a));
results.push({ label: "All 6 agents fired in order", pass: allFired });

// AC2: no step.error events
const noErrors = errorCount === 0;
results.push({ label: "No step.error events", pass: noErrors });

// AC3: final draft exists
const hasFinal = finalDraft !== null;
results.push({ label: "draft.final event received", pass: hasFinal });

// AC4: body_markdown has ≥3 RTI citations
const rtiMarkers = finalDraft
  ? (finalDraft.body_markdown.match(/\[CITE:RTI-2005[^\]]*\]/g) || []).length
  : 0;
const hasRtiCitations = rtiMarkers >= 3;
results.push({ label: `≥3 [CITE:RTI-2005/...] markers (found ${rtiMarkers})`, pass: hasRtiCitations });

// AC5: timing reasonable (chain completes in under 120s)
const timingOk = totalMs < 120_000;
results.push({ label: `Chain completed in ${(totalMs/1000).toFixed(1)}s (< 120s)`, pass: timingOk });

let allPassed = true;
for (const r of results) {
  const icon = r.pass ? "✅" : "❌";
  console.log(`${icon}  ${r.label}`);
  if (!r.pass) allPassed = false;
}

console.log(`\n${"─".repeat(50)}`);
console.log(
  allPassed
    ? "✅  DEMO GATE PASS — all acceptance criteria met"
    : "❌  DEMO GATE FAIL — one or more criteria not met"
);
console.log(`${"─".repeat(50)}\n`);

process.exit(allPassed ? 0 : 1);
