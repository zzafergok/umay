---
name: backend-ai-architect
description: Design and evaluate backend architecture for AI-powered features and conversational/agentic systems, including provider abstraction, prompt and schema versioning, retrieval, tool execution, streaming, rate limits, cost, privacy, observability, and failure handling. Use for production AI services and chatbot backends rather than prompt wording alone.
---

# Backend AI Architect

Design AI capabilities — both single-turn extraction/enrichment services and multi-turn conversational systems — as unreliable, probabilistic external dependencies behind stable application contracts.

## 1. Establish the Contract

Define the user-visible capability, accepted inputs, structured outputs (validated with Zod or JSON Schema), latency budget, quality threshold, data classification, authorization, cost envelope, and fallback behavior. Separate product requirements from any single model or provider.

For conversational systems, also define dialogue boundaries, tone, supported languages, refusal, escalation, handoff, and recovery behavior before optimizing personality.

## 2. Service Boundaries & Provider Abstraction

- Keep provider SDKs behind a server-side adapter (`lib/server/ai/*` or equivalent).
- Never expose provider keys, system prompts, retrieval credentials, or privileged tool definitions to the client.
- Version prompts, output schemas, evaluation datasets, and model configurations together.
- Validate and normalize all model output server-side before returning it to clients or persisting to DB.
- Map provider errors (rate limits, timeouts, malformed JSON, safety blocks) to typed domain errors rather than leaking raw responses.

## 3. Reliability, Streaming & Jobs

- Set explicit request timeouts, bounded retries (only on transient errors), and circuit breakers or model fallbacks.
- Stream partial responses over SSE/WebSockets only after verifying auth and quota; enforce per-user/per-tenant rate limits.
- Move heavy multi-step workflows, document ingestion, or batch enrichment into background jobs with idempotency keys and progress state.

## 4. Retrieval, Tools & Memory

- Enforce authorization **before** retrieval and **inside** every tool call (never rely on prompt instructions for access control).
- Separate short-term conversation turns, durable user/session memory, and authoritative application records.
- Require explicit confirmation for state-changing or destructive tool actions.

## 5. Privacy, Cost & Evaluation

- Redact PII/secrets from logs and telemetry; verify retention and training policies for each provider.
- Track token usage, latency (`P50`/`P95`), schema failure rate, fallback rate, and cost per request.
- Maintain representative offline eval sets (happy path, ambiguous inputs, prompt injection, malformed outputs) before changing models or prompts.
