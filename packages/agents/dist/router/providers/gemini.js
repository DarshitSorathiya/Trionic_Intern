"use strict";
/**
 * providers/gemini.ts
 * Owner: Yug Gandhi (LLM Router)
 *
 * Gemini (Google) provider — FUNCTIONAL in Week 2.
 * Requires GOOGLE_API_KEY in environment.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGemini = callGemini;
const generative_ai_1 = require("@google/generative-ai");
let client = null;
function getClient() {
    if (!client) {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            throw new Error("[GeminiProvider] GOOGLE_API_KEY is not set in environment.");
        }
        client = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    return client;
}
/**
 * Call Gemini with the given prompt and return a structured LLMResponse.
 * This is the ONLY function other agents should call — do not import GoogleGenerativeAI SDK elsewhere.
 */
async function callGemini(req) {
    const genAI = getClient();
    const startMs = Date.now();
    const model = genAI.getGenerativeModel({
        model: req.model,
        systemInstruction: req.systemPrompt,
        generationConfig: {
            maxOutputTokens: req.maxTokens,
            temperature: req.temperature,
        },
    });
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: req.userPrompt }] }]
    });
    const latency_ms = Date.now() - startMs;
    const text = result.response.text() || "";
    // Gemini token counting
    const usage = result.response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 };
    const tokens_in = usage.promptTokenCount || 0;
    const tokens_out = usage.candidatesTokenCount || 0;
    // Gemini pricing (as of May 2026)
    const isFlash = req.model.toLowerCase().includes("flash");
    const INPUT_COST_PER_1K = isFlash ? 0.000075 : 0.00125;
    const OUTPUT_COST_PER_1K = isFlash ? 0.0003 : 0.005;
    const cost_usd = ((tokens_in / 1000) * INPUT_COST_PER_1K) +
        ((tokens_out / 1000) * OUTPUT_COST_PER_1K);
    return {
        text,
        model: req.model,
        provider: "gemini",
        tokens_in,
        tokens_out,
        cost_usd,
        latency_ms,
        fallback_used: false,
    };
}
//# sourceMappingURL=gemini.js.map