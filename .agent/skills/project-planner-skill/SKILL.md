---
name: project-planner-skill
description: Generate comprehensive project planning documents — requirements, system design, and phased, evidence-based implementation plans. Use when starting a new feature or project, defining specifications, or producing a technical implementation plan from requirements, designs, or an existing codebase.
---

# Project & Implementation Planner

Turn software ideas, requirements, or existing codebases into structured, traceable requirements, technical designs, and phased implementation plans that another engineer can execute without rediscovering the system.

## When to Use This Skill

- Starting a new feature or project from scratch (`requirements` → `design` → `tasks`)
- Producing an evidence-based, phased implementation plan from an existing codebase before coding
- Breaking complex implementations into verifiable, dependency-ordered tasks

---

## 1. Inspect First (For Existing Codebases)

When planning changes on an existing repository:

- Trace relevant implementation paths: entry points, data flow, types, APIs, state, UI, persistence, tests, and observability.
- Cite concrete files and symbols where they exist; mark proposed paths as proposed.
- Check project rules (`AGENTS.md` — e.g. 250-line limit, `@/components/core/*`, `@/components/forms/*`, `zod` + `react-hook-form`, `tr`/`en` i18n).
- Ask only when an unresolved product/architecture decision would materially change the plan; otherwise state reasonable assumptions.

---

## 2. Core Planning Documents

| Document            | Purpose                                                | Typical File                 |
| ------------------- | ------------------------------------------------------ | ---------------------------- |
| Requirements        | User stories + measurable acceptance criteria          | `requirements.md`            |
| Design              | Architecture + components + data flow + error handling | `design.md`                  |
| Implementation Plan | Phased tasks, dependencies, verification & rollout     | `tasks.md` / `tasks/todo.md` |

### Requirements Template (When Starting from Idea/Spec)

```markdown
# Requirements — [Feature Name]

## Introduction

[System description, target user, and scope.]

## Requirements

### Requirement 1

**User Story:** As a [user type], I want [capability], so that I can [benefit].

#### Acceptance Criteria

1. WHEN [trigger/condition], [component] MUST [action/behavior]
2. IF [condition], [component] MUST [action]
3. [component] MUST COMPLETE [operation] WITHIN [duration]
```

### Design Summary Template

- **Component Map & Architecture:** Component IDs, responsibilities, interactions, and module boundaries.
- **Data Flow & Models:** Request/response sequences, schemas, lifecycle, and migration needs.
- **Error Handling & Test Strategy:** Error categories, unit/integration/E2E coverage.

---

## 3. Phased Implementation Plan Template

Break work into dependency-ordered, risk-reducing phases that leave the repository in a coherent state (data/contract changes before consumers; vertical slices before cross-cutting polish):

```markdown
# Implementation Plan — [Feature / Outcome]

## Context & Scope

- **Must-have / In-scope:** ...
- **Non-goals / Out of scope:** ...
- **Decisions & Assumptions:** ...

## Phases

### Phase 1: [Verifiable Milestone]

- **Goal & Rationale:** ...
- **Changes:** Files/components to create or modify (with requirement IDs)
- **Verification:** Tests, type-check, build, or user-visible behavior checks
- **Dependencies & Risks:** ...

## Rollout, Compatibility & Rollback

## Open Decisions
```

---

## 4. Planning Rules & Quality Checklist

- Match the project's language, framework, architecture, and testing conventions.
- Cover failure, empty, loading, permission, accessibility, localization (`tr`/`en`), and operational states.
- Do not write full implementation code inside the plan unless a small contract/schema snippet prevents ambiguity.
- Avoid fabricated line numbers, commands, files, or estimates.
- Verify every requirement has traceable, independently verifiable tasks and end-to-end acceptance criteria.
