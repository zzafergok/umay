---
name: backend-ai-architect
description: Design and evaluate backend architecture for AI-powered features and conversational/agentic systems, including provider abstraction, prompt and schema versioning, retrieval, tool execution, streaming, rate limits, cost, privacy, observability, and failure handling.
---

# Backend AI Architect

Design AI capabilities — both single-turn extraction/enrichment services and multi-turn conversational systems — as unreliable, probabilistic external dependencies behind stable application contracts.

## 1. Establish the Contract

Define the user-visible capability, accepted inputs, structured outputs, latency budget, quality threshold, data classification, authorization, cost envelope, and fallback behavior. Separate product requirements from a particular model or provider.

For conversational systems, also define dialogue boundaries, tone, supported languages, refusal, escalation, handoff, and recovery behavior before optimizing personality.

## 2. Service Boundaries & Architecture

- Keep provider SDKs behind an adapter owned by the trusted backend (never expose provider keys to the client).
- Validate and normalize all model output and tool arguments with strict schemas (e.g. Zod) before returning to clients or downstream code.
- Version prompts, schemas, evaluation sets, and material model configuration.
- Enforce authorization outside the model; the model never grants itself permission.
- Use typed domain errors instead of leaking raw upstream provider responses or metadata.
- Preserve request identifiers (`x-request-id`) and safe operational metadata for debugging.

## 3. Reliability, Streaming & Jobs

Set bounded timeouts, retries, concurrency, and per-user/IP rate limits. Retry only errors that are safe and likely transient, with idempotency for operations that can duplicate effects. Define behavior for timeout, malformed output, refusal, safety block, quota exhaustion, provider outage, and partial streaming failure.

Use queues or durable jobs when work exceeds interactive latency or must survive restarts. Support cancellation and result expiry where relevant.

## 4. Retrieval, Tools & Memory

- Treat retrieved content as untrusted data; preserve provenance and evaluate retrieval separately from generation.
- Tool calls require typed inputs, server-side authorization, impact-aware confirmation for consequential actions, execution limits, and output sanitization.
- Distinguish ephemeral session state from durable memory; store persistent memory only with explicit user consent and scope.

## 5. Privacy, Cost & Evaluation

Minimize data sent to providers, redact sensitive fields where possible, and track usage/cost by feature without logging raw sensitive prompts. Build representative offline evaluations (including edge cases, prompt injection, and unavailable tools) before changing models or prompts, and roll out material changes gradually.
