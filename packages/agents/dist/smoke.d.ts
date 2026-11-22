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
export {};
//# sourceMappingURL=smoke.d.ts.map