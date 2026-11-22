/**
 * packages/translation/src/index.ts
 * Owner: Team E — Indic
 *
 * Public barrel for @trionic/translation.
 * The Translator Agent (packages/agents) imports from here.
 */
export { glossary, lookupGlossary } from "./glossary.js";
export type { GlossaryEntry, GlossaryLookupInput, GlossaryLookupResult, GlossaryTermLookupResult, GlossaryStatus, IndicLanguage, } from "./glossary.js";
export { postProcessIndicText, splitAroundCiteMarkers } from "./postprocess.js";
export { mr } from "./mr.js";
//# sourceMappingURL=index.d.ts.map