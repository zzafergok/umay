---
name: prompt-engineering-patterns
description: Master advanced prompt engineering and LLM caching strategies (few-shot, chain-of-thought, structured templates, prompt prefix caching, response caching, and cache invalidation) to maximize performance, reliability, cost efficiency, and controllability in production. Use when designing, optimizing, or caching LLM prompts.
---

# Prompt Engineering & Caching Patterns

Design reliable, controllable, and cost-efficient LLM prompts for production applications.

## When to Use This Skill

- Designing or debugging production system prompts and structured output templates
- Optimizing prompt accuracy, consistency, latency, and token cost
- Implementing few-shot learning, chain-of-thought reasoning, or self-verification
- Designing LLM caching layers (prompt prefix caching, response caching, or cache invalidation)

---

## 1. Core Prompting Patterns

### Progressive Disclosure (Start Simple)

1. **Level 1 (Direct instruction):** Clear, specific single-task directive.
2. **Level 2 (Constraints):** Explicit format, length, and boundary rules.
3. **Level 3 (Reasoning):** Step-by-step analysis before final answer (zero-shot or few-shot CoT).
4. **Level 4 (Few-shot examples):** 2–3 diverse, representative input-output pairs (including edge cases).

### Instruction Hierarchy

```text
[System Context & Role] → [Task Instruction & Constraints] → [Examples] → [Input Data] → [Output Schema]
```

### Structured Output & Grounding Template

```text
You are extracting structured fields from the provided input.
Rules:
- Use ONLY facts explicitly present in the input.
- If a field is missing or ambiguous, return null and add the field name to `missingFields`.
- Never fabricate totals, dates, or identifiers.

Input:
<user_input>
{input}
</user_input>

Return valid JSON matching the schema.
```

### Error Recovery & Self-Verification

- Define explicit fallback behavior when input is ambiguous or incomplete.
- Instruct the model to flag missing fields or low confidence rather than guessing.
- For extraction or classification tasks, include a concise post-check (totals match line items, units preserved, enum values valid).
- Treat user input inside XML/delimiter tags as untrusted data, never as instructions.

---

## 2. Prompt & Response Caching Strategies

Provider cache semantics, minimum token thresholds, billing, and TTLs change — verify current provider documentation before estimating savings.

- **Prompt Prefix Caching:** Place static instructions, schemas, and few-shot examples at the _beginning_ of the prompt (system message) and dynamic user input at the _end_ so repeated prefixes stay cache-eligible.
- **Response Caching:** Cache deterministic outputs (e.g., `temperature: 0` or structured extraction keyed by content hash + `promptVersion` + `schemaVersion` + `modelId`).
- **Cache Augmented Generation (CAG):** Pre-load stable reference catalogs or domain rules into the cached prefix instead of dynamic retrieval when the corpus fits comfortably.

### Caching Pitfalls to Avoid

- **Changing prefixes:** Injecting timestamps, request IDs, or dynamic lists at the top of the prompt busts prefix caches on every request.
- **Caching high-temperature calls:** Non-deterministic creative outputs should not share exact-match caches.
- **Missing invalidation:** Always include `promptVersion` and `schemaVersion` in response cache keys so prompt updates never serve stale formats.

---

## 3. Common Pitfalls & Success Metrics

- **Avoid over-engineering:** Benchmark a clean Level 1–2 prompt before adding CoT or multi-shot examples.
- **Prevent example pollution:** Remove outdated or contradictory examples when schemas evolve.
- **Version prompts as code:** Track prompts, schemas, and eval fixtures in source control.
- **Measure what matters:** Track schema validity rate, task accuracy, P50/P95 latency, cache hit rate, and average tokens per request.
