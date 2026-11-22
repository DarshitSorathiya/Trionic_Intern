"use strict";
/**
 * packages/translation/src/index.ts
 * Owner: Team E — Indic
 *
 * Public barrel for @trionic/translation.
 * The Translator Agent (packages/agents) imports from here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mr = exports.splitAroundCiteMarkers = exports.postProcessIndicText = exports.lookupGlossary = exports.glossary = void 0;
// ─── Glossary ─────────────────────────────────────────────────────────────────
var glossary_js_1 = require("./glossary.js");
Object.defineProperty(exports, "glossary", { enumerable: true, get: function () { return glossary_js_1.glossary; } });
Object.defineProperty(exports, "lookupGlossary", { enumerable: true, get: function () { return glossary_js_1.lookupGlossary; } });
// ─── Post-processing ──────────────────────────────────────────────────────────
var postprocess_js_1 = require("./postprocess.js");
Object.defineProperty(exports, "postProcessIndicText", { enumerable: true, get: function () { return postprocess_js_1.postProcessIndicText; } });
Object.defineProperty(exports, "splitAroundCiteMarkers", { enumerable: true, get: function () { return postprocess_js_1.splitAroundCiteMarkers; } });
// ─── Marathi Translations ─────────────────────────────────────────────────────
var mr_js_1 = require("./mr.js");
Object.defineProperty(exports, "mr", { enumerable: true, get: function () { return mr_js_1.mr; } });
//# sourceMappingURL=index.js.map