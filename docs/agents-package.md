# `@trionic/agents` — Package Documentation

> **Week 1 Status** | Commit: `2413eca` — _"feat: Scaffold and complete agent structure"_  
> **Author:** Malay Sheta (Team C Lead — scaffolder)  
> **Location:** `packages/agents/`

---

## Overview

`@trionic/agents` is the core agent-orchestration package for AI Adalat. It hosts every AI agent in the pipeline, the pluggable LLM Router, and the tracing layer. The **API layer (Team B)** imports exclusively from this package's public barrel (`src/index.ts`) — never from internal sub-paths.

### Agent Pipeline (Left → Right)

```
User Intake
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Classifier │───►│   Planner   │───►│   Drafter   │
│ Kathan P.   │    │  Malay S.   │    │  Jenil S.   │
└─────────────┘    └─────────────┘    └─────────────┘
                                             │
                        ┌────────────────────┘
                        ▼
               ┌─────────────────┐    ┌─────────────┐
               │Citator-Gatekeeper│───►│   Reviewer  │
               │ Hitarth S.      │    │  Evan G.    │
               └─────────────────┘    └─────────────┘
                                             │
                        ┌────────────────────┘
                        ▼
               ┌─────────────┐    ┌──────────────────┐
               │  Translator  │───►│  DocumentDraft   │
               │ Maharshi P. │    │  (Final Output)  │
               └─────────────┘    └──────────────────┘
```

Every agent call passes through the **LLM Router** and emits an **AgentTrace** that is persisted to Supabase.

---

## Public API (`src/index.ts`)

All exports available to Team B:

### LLM Router
```ts
import { LLMRouter, router } from "@trionic/agents";
import type { LLMRequest, LLMResponse } from "@trionic/agents";
```

### Tracing
```ts
import { buildTrace, buildErrorTrace, persistTrace } from "@trionic/agents";
import type { TraceInput } from "@trionic/agents";
```

### Agents
```ts
import { PlannerAgent, runPlanner }           from "@trionic/agents";
import { ClassifierAgent, runClassifier }     from "@trionic/agents";
import { DrafterAgent, runDrafter }           from "@trionic/agents";
import { CitatorGatekeeperAgent, runCitator } from "@trionic/agents";
import { ReviewerAgent, runReviewer }         from "@trionic/agents";
import { TranslatorAgent, runTranslator }     from "@trionic/agents";
```

### Pipeline Types
```ts
import type { PipelineInput, PipelineResult } from "@trionic/agents";
```

---

## Agents

### ✅ Planner Agent
**File:** `src/planner/index.ts`  
**Owner:** Malay Sheta  
**Status:** ✅ Functional (Week 1)

The Planner agent takes classified intake text and produces a structured plan for the Drafter, deciding:
- Which document type to produce
- Which PageIndex queries to run
- Which Indian acts apply
- Which template to use

**Types:**
```ts
interface PlannerInput {
  intakeText: string;
  classifierOutput: ClassifierOutput;
  language: SupportedLanguage;
  session_id?: string;
}

interface PlannerResult {
  plan: PlannerOutput;  // From @trionic/shared
  trace: AgentTrace;
}
```

**Usage:**
```ts
import { runPlanner } from "@trionic/agents";

const result = await runPlanner({
  intakeText: "My employer hasn't paid salary for 3 months",
  classifierOutput: { is_legal: true, domain: "employment", ... },
  language: "en",
  session_id: "user-uuid-123",
});
// result.plan → structured PlannerOutput
// result.trace → AgentTrace (already persisted)
```

**LLM Model:** `claude-3-5-sonnet-20241022` via Claude provider  
**Error behaviour:** Never throws — errors are captured in the trace as `status: "error"` and re-thrown with the trace attached.

---

### 🔲 Classifier Agent
**File:** `src/classifier/index.ts`  
**Owner:** Kathan Purohit  
**Status:** 🔲 Stub (Week 1) — types + interface defined, implementation pending

Determines whether the user's intake is a legal matter and classifies it by domain and relevant acts.

**Types:**
```ts
interface ClassifierInput {
  intakeText: string;
  language: SupportedLanguage;
  session_id?: string;
}

interface ClassifierResult {
  classification: ClassifierOutput; // From @trionic/shared
  trace: AgentTrace;
}
```

**Note:** `runClassifier()` currently throws `"ClassifierAgent not yet implemented"`. Kathan Purohit is the implementation owner.

---

### ✅ Drafter Agent
**File:** `src/drafter/index.ts`  
**Owner:** Jenil Sutariya  
**Status:** ✅ Functional (Week 1) — full implementation present

The Drafter produces a full markdown legal document draft with `[CITE:<node_id>]` markers embedded in the text.

**Sub-files:**
| File | Purpose |
|------|---------|
| `types.ts` | `DrafterInput`, `DrafterResult` types |
| `citations.ts` | `extractCitations()`, `extractNodeIds()`, regex constants |
| `drafter.agent.ts` | `runDrafter()`, `reviseDraft()`, `DrafterAgent` class |
| `drafter.prompt.ts` | System prompt, user prompt builder, revision prompt builder |

**Key exports:**
```ts
import {
  DrafterAgent, runDrafter, reviseDraft,
  extractCitations, extractNodeIds,
  CITE_MARKER_REGEX, PROVISIONAL_SNAPSHOT_ID,
  DRAFTER_SYSTEM_PROMPT, buildDrafterUserPrompt, buildDrafterRevisionPrompt,
} from "@trionic/agents";
```

---

### 🔲 Citator-Gatekeeper Agent
**File:** `src/citator/index.ts`  
**Owner:** Hitarth Sherathia  
**Status:** 🔲 Stub (Week 1) — types + interface defined, implementation pending

Validates every `[CITE:<node_id>]` marker against the real PageIndex. Acts as a gatekeeper — if any citation is invalid, the draft is rejected before reaching the Reviewer.

**Types:**
```ts
interface CitatorInput {
  draft: DocumentDraft;
  session_id?: string;
}

interface CitatorResult {
  passed: boolean;
  validatedCitations: Citation[];
  rejection_reason?: string;
  trace: AgentTrace;
}
```

---

### 🔲 Reviewer Agent
**File:** `src/reviewer/index.ts`  
**Owner:** Evan Gregor  
**Status:** 🔲 Stub (Week 1) — types + interface defined, implementation pending

Reviews the citator-validated draft for legal accuracy, coherence, and completeness.

**Types:**
```ts
interface ReviewerInput {
  draft: DocumentDraft;
  session_id?: string;
}

interface ReviewerResult {
  approved: boolean;
  feedback: string;
  rejection_reason?: string;
  trace: AgentTrace;
}
```

---

### 🔲 Translator Agent
**File:** `src/translator/index.ts`  
**Owner:** Maharshi Patel  
**Status:** 🔲 Stub (Week 1) — types + interface defined, implementation pending

Translates the approved English draft into the user's requested language (Hindi, Gujarati, Marathi, or Tamil).

**Types:**
```ts
interface TranslatorInput {
  draft: DocumentDraft;
  targetLanguage: SupportedLanguage;
  session_id?: string;
}

interface TranslatorResult {
  translatedDraft: DocumentDraft;
  trace: AgentTrace;
}
```

---

## LLM Router

**Files:** `src/router/index.ts`, `src/router/router.config.ts`, `src/router/providers/`  
**Owner:** Yug Gandhi  
**Status:** ✅ Pluggable, Claude LIVE, Gemini/GPT stubbed

The LLM Router is the **single point** through which all agent LLM calls flow. Agents **must never** import provider SDKs directly.

### How it works

1. Agent calls `router.run(step, systemPrompt, userPrompt)`
2. Router looks up `step` in `ROUTER_CONFIG` to get `provider` + `model`
3. Router dispatches to the appropriate provider function
4. Provider returns a typed `LLMResponse`

### Step-to-Model Mapping (`router.config.ts`)

| Agent Step | Provider | Model | Max Tokens | Temperature |
|-----------|---------|-------|-----------|------------|
| `planner` | Claude ✅ | `claude-3-5-sonnet-20241022` | 1024 | 0.2 |
| `classifier` | Claude ✅ | `claude-3-5-sonnet-20241022` | 512 | 0.1 |
| `drafter` | Claude ✅ | `claude-3-5-sonnet-20241022` | 4096 | 0.3 |
| `citator` | Claude ✅ | `claude-3-5-sonnet-20241022` | 256 | 0.0 |
| `reviewer` | Gemini 🔲 | `gemini-1.5-pro` | 1024 | 0.2 |
| `translator` | Gemini 🔲 | `gemini-1.5-pro` | 2048 | 0.1 |

> 🔲 = Provider stubbed in Week 1. Returns mock response. Wire real SDK in Week 2.

**Default fallback:** Claude `claude-3-5-sonnet-20241022` (used if step not found in config).

### Rerouting a model (zero code change)
To switch the Reviewer from Gemini to Claude, update only `router.config.ts`:
```ts
reviewer: {
  provider: "claude",
  model: "claude-3-5-sonnet-20241022",
  maxTokens: 1024,
  temperature: 0.2,
},
```

### Provider Status

| Provider | File | Status | Env Key |
|---------|------|--------|---------|
| Claude (Anthropic) | `providers/claude.ts` | ✅ LIVE | `ANTHROPIC_API_KEY` |
| Gemini (Google) | `providers/gemini.ts` | 🔲 Stub | `GEMINI_API_KEY` (Week 2) |
| GPT (OpenAI) | `providers/gpt.ts` | 🔲 Stub | `OPENAI_API_KEY` (Week 2) |

### Interfaces
```ts
interface LLMRequest {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
}

interface LLMResponse {
  text: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  latency_ms: number;
}
```

---

## Tracing Layer

**Files:** `src/tracing/tracer.ts`, `src/tracing/index.ts`  
**Owner:** Umrania Yug  
**Status:** ✅ Functional — Week 1 persists via `console.log`; Week 2 wires Supabase

Every agent **must** call `buildTrace()` after every LLM call and `persistTrace()` before returning.

### `buildTrace(input: TraceInput): AgentTrace`
Constructs a fully-typed `AgentTrace` object from a completed `LLMResponse`. Pure function, no I/O.

### `buildErrorTrace(agent, error, session_id?): AgentTrace`
Builds an error trace when an agent fails _before_ reaching the LLM (e.g. JSON parse error).

### `persistTrace(trace: AgentTrace): Promise<void>`
**Week 1:** Logs to console.  
**Week 2 (TODO):** Insert into Supabase `agent_traces` table via `@trionic/db`.

### Example (from `planner/index.ts`):
```ts
const trace = buildTrace({
  agent: "planner",
  llmResponse,
  cited_nodes: [],   // Planner doesn't emit citations
  status: "ok",
  session_id,
});
await persistTrace(trace);
```

---

## Pipeline Types (`src/types.ts`)

```ts
/** Input provided by Team B's API layer to start a full pipeline run. */
interface PipelineInput {
  intakeText: string;
  outputLanguage: SupportedLanguage;
  session_id: string;
}

/** Output returned to Team B after a complete pipeline run. */
interface PipelineResult {
  finalDraftText: string;
  success: boolean;
  traces: AgentTrace[];
  rejection_reason?: string;
}
```

---

## Environment Variables

| Variable | Required By | Notes |
|---------|------------|-------|
| `ANTHROPIC_API_KEY` | Claude provider | Required in Week 1 for live calls |
| `GEMINI_API_KEY` | Gemini provider | Needed in Week 2 when Gemini is un-stubbed |
| `OPENAI_API_KEY` | GPT provider | Needed in Week 2 when GPT is un-stubbed |

---

## Week 2 TODOs

- [ ] **`src/tracing/index.ts`** — Wire `persistTrace()` to Supabase via `@trionic/db`
- [ ] **`src/router/providers/gemini.ts`** — Implement real `@google/generative-ai` SDK calls
- [ ] **`src/router/providers/gpt.ts`** — Implement real `openai` SDK calls
- [ ] **`src/classifier/index.ts`** — Kathan Purohit implements `runClassifier()`
- [ ] **`src/citator/index.ts`** — Hitarth Sherathia implements `runCitator()`
- [ ] **`src/reviewer/index.ts`** — Evan Gregor implements `runReviewer()`; add `reviewer.prompt.ts`
- [ ] **`src/translator/index.ts`** — Maharshi Patel implements `runTranslator()`

---

## Tests

| File | What it tests |
|------|--------------|
| `src/planner/planner.test.ts` | `runPlanner()` with mocked router |
| `src/router/router.test.ts` | `LLMRouter.resolve()`, step→config mapping |
| `src/tracing/tracing.test.ts` | `buildTrace()`, `buildErrorTrace()` |
| `src/drafter/drafter.test.ts` | `runDrafter()`, `reviseDraft()`, prompt builders |
| `src/drafter/citations.test.ts` | `extractCitations()`, `extractNodeIds()`, regex |

Run tests:
```bash
pnpm --filter @trionic/agents test
```
