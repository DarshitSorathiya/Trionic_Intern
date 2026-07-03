# RFC: Agent API Surface

**Author:** Prashant Gangani  
**Team:** Backend  
**Date:** May 21, 2026

## 1. Overview

This RFC defines the API surface that the frontend will use to invoke backend agents and stream tokens (responses) back to the UI. It covers the request/response shape, error handling, cancellation mechanism, and the choice between Server-Sent Events (SSE) and fetch-streaming.

## 2. Streaming Mechanism: Fetch-Streaming vs. SSE

**Decision:** We will use **Fetch API with Streams (ReadableStream)** via Next.js Route Handlers.

_Reasoning:_

- Native support in the browser without relying on the EventSource API restrictions (like lack of easy POST support or custom headers in `EventSource`).
- Easy to use with `ai/react` or manual async iterators on the frontend.
- Fits seamlessly into standard Next.js App Router API design.

## 3. Request Shape

The API will be a `POST` endpoint, e.g., `/api/agents/chat`.

```json
// POST /api/agents/chat
{
  "messages": [
    {
      "role": "user",
      "content": "Retrieve the contract clauses for ..."
    }
  ],
  "agentConfig": {
    "agentType": "drafter", // e.g., drafter, reviewer, citator
    "model": "gpt-4" // optional, if we need to let the frontend specify
  },
  "context": {
    "pageIndexId": "node-1234" // For Citation-or-die rules
  }
}
```

## 4. Response Shape (Streamed)

The endpoint returns a `text/event-stream` or raw stream of JSON objects separated by newlines (NDJSON), allowing parsing chunk-by-chunk.

Each chunk will look like:

```json
{
  "type": "token",
  "content": "Here is the",
  "metadata": {
    "citations": []
  }
}
```

Final chunk (signifying end):

```json
{
  "type": "done",
  "finishReason": "stop"
}
```

## 5. Error Model

Errors will be returned gracefully. If an error occurs before the stream starts, we return standard HTTP specific codes:

- `400 Bad Request` (Invalid payload)
- `401 Unauthorized` (Failed RLS/Auth)
- `429 Too Many Requests` (Rate limit)
- `500 Internal Server Error` (Agent failed)

If an error occurs **during** the stream, we emit an error chunk and terminate the stream:

```json
{
  "type": "error",
  "error": {
    "code": "AGENT_TIMEOUT",
    "message": "The upstream inference provider timed out."
  }
}
```

## 6. Cancellation

When the frontend aborts the fetch request (via `AbortController`), the ReadableStream on the server will cancel. The backend should detect the aborted signal (`request.signal.aborted`) and propagate to the Agno agent framework, ensuring no extra compute or tokens are wasted.
