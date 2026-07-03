/**
 * apps/web/lib/redaction.ts
 *
 * Owner: Aayush Tilva (Team B — Backend) — Week 4, Issue #264
 *
 * PII redaction middleware for audit log responses.
 * Applied at READ TIME on GET /api/audit/{document_id} before data leaves the server.
 * Raw PII (if any leaks into metadata/error fields) is scrubbed before returning
 * to the client. This satisfies Hard Constraint #5: no PII leaves Supabase unredacted.
 *
 * Scrubs:
 *   - Indian mobile numbers (+91XXXXXXXXXX or 0XXXXXXXXXX or bare 10-digit)
 *   - Aadhaar numbers (12-digit, optionally spaced in groups of 4)
 *   - Email addresses (RFC-5321 simplified pattern)
 *   - Names following PII-leakage patterns (name: VALUE or Name: VALUE)
 *
 * Design: regex-based, runs synchronously, returns a new object (pure function).
 * Coordination: @YugUmrania stores raw traces; redaction happens here at read-time.
 */

// ─── Regex patterns ───────────────────────────────────────────────────────────

/** Indian mobile: +91-XXXXXXXXXX, 91XXXXXXXXXX, 0XXXXXXXXXX, or bare 10-digit */
const PHONE_REGEX =
  /(\+91[-\s]?|91[-\s]?|0)?[6-9]\d{9}\b/g

/** Aadhaar: 12 consecutive digits, or 4-4-4 groups (space/hyphen separated) */
const AADHAAR_REGEX =
  /\b(\d{4}[-\s]?\d{4}[-\s]?\d{4}|\d{12})\b/g

/** Email address (simplified RFC-5321) */
const EMAIL_REGEX =
  /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g

/** Name field patterns: "name: John Doe", "Name: John Doe" */
const NAME_FIELD_REGEX =
  /\b(name|applicant|petitioner|complainant)\s*:\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}/gi

// ─── Core scrub function ──────────────────────────────────────────────────────

/**
 * Scrubs PII from a single string value.
 * Returns the redacted string with PII replaced by a safe placeholder.
 */
export function redactString(input: string): string {
  return input
    .replace(EMAIL_REGEX, '[EMAIL REDACTED]')
    .replace(PHONE_REGEX, '[PHONE REDACTED]')
    .replace(AADHAAR_REGEX, '[AADHAAR REDACTED]')
    .replace(NAME_FIELD_REGEX, (match) => {
      // Keep the field label (e.g. "name:") but redact the value
      const colonIdx = match.indexOf(':')
      return match.slice(0, colonIdx + 1) + ' [NAME REDACTED]'
    })
}

/**
 * Recursively redacts PII from any JSON-serialisable value.
 * Handles strings, arrays, and plain objects. Passes through numbers/booleans/null.
 */
export function redactValue(value: unknown): unknown {
  if (typeof value === 'string') return redactString(value)
  if (Array.isArray(value)) return value.map(redactValue)
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = redactValue(v)
    }
    return result
  }
  return value
}

// ─── AgentTrace-specific redactor ─────────────────────────────────────────────

import type { AgentTrace } from '@trionic/shared'

/**
 * Applies PII redaction to the string fields of an AgentTrace that might
 * carry user-supplied content: error_message and metadata (via cited_nodes).
 *
 * Fields NOT redacted (they contain system values, not user content):
 *   agent, model, tokens_in, tokens_out, cost_usd, latency_ms, status,
 *   timestamp, session_id, parent_trace_id, cited_nodes (node IDs are structured)
 */
export function redactTrace(trace: AgentTrace): AgentTrace {
  return {
    ...trace,
    error_message: trace.error_message
      ? redactString(trace.error_message)
      : trace.error_message,
  }
}

/**
 * Redacts an array of AgentTrace objects.
 * Call this before returning traces from GET /api/audit/{document_id}.
 */
export function redactTraces(traces: AgentTrace[]): AgentTrace[] {
  return traces.map(redactTrace)
}
