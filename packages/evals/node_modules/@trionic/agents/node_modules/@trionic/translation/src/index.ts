
/**
 * packages/translation/src/index.ts
 * Owner: Team E — Indic
 *
 * Public barrel for @trionic/translation.
 * The Translator Agent (packages/agents) imports from here.
 */

// ─── Glossary ─────────────────────────────────────────────────────────────────
export { glossary, lookupGlossary } from "./glossary.js";
export type {
  GlossaryEntry,
  GlossaryLookupInput,
  GlossaryLookupResult,
  GlossaryTermLookupResult,
  GlossaryStatus,
  IndicLanguage,
} from "./glossary.js";

// ─── Post-processing ──────────────────────────────────────────────────────────
export { postProcessIndicText, splitAroundCiteMarkers } from "./postprocess.js";
// ─── Marathi Translations ─────────────────────────────────────────────────────
export { mr } from "./mr.js";
