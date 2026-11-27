---
name: code-review-excellence
description: Review code changes for correctness, regressions, security, maintainability, performance, tests, and operational impact, or evaluate review feedback constructively. Use when conducting PR reviews, pre-merge self-reviews, or processing review comments.
---

# Code Review Excellence

Provide high-signal, constructive code reviews focused on correctness, risk, and maintainability rather than style nitpicks.

## 1. Review Order (Highest Risk First)

1. **Scope & architecture fit:** Does the change match requirements, repository conventions (`AGENTS.md`), and module boundaries?
2. **Correctness & edge cases:** Null/empty states, race conditions, timezone/locale handling, boundary inputs, and error recovery.
3. **Security & privacy:** Auth/ownership checks on every endpoint, server-side validation, secret handling, XSS/injection, and safe error responses.
4. **Data & performance:** Unbounded queries, N+1 calls, missing pagination, unnecessary client bundles or re-renders.
5. **Tests & maintainability:** Meaningful assertions on behavior and failure paths, readable naming, small cohesive functions.

## 2. Severity Labels & Finding Format

Tag every finding clearly so authors know what blocks merge:

- `[blocking]` — Bug, security gap, data loss risk, or broken contract; must fix before merge.
- `[important]` — Maintainability, missing test coverage, or performance issue worth addressing now.
- `[nit]` — Optional polish or naming suggestion; non-blocking.

Report findings concisely with `path/to/file:line`, concrete impact, and a specific fix or question.

## 3. Receiving Review Feedback

- Evaluate every comment technically against codebase evidence before agreeing or changing code.
- If a suggestion conflicts with project architecture or introduces risk, explain why with file/behavior evidence rather than blindly complying.
- Clarify ambiguous feedback before implementing.

## 4. Pre-Merge Verification Checklist

- [ ] Type-check, linter, unit/integration tests, and production build pass after final edit
- [ ] No debug logs, dead code, `any` escapes, or unintended file changes in `git diff`
- [ ] UI changes verified across light/dark mode, mobile/desktop, and loading/error/empty states
