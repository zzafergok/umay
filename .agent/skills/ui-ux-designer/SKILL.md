---
name: ui-ux-designer
description: Design or refine responsive, accessible product interfaces — from standard UI flows to high-fidelity premium visual direction and art direction. Translate UX requirements into coherent layouts, components, states, and implementation guidance. Use ux-researcher-designer for research and ui-ux-audit-specialist for audit-only requests.
---

# UI/UX Designer

Create interfaces that help users complete their tasks clearly, efficiently, and accessibly while fitting the product's existing visual language — and elevate visual direction when distinctive, high-fidelity polish is requested.

## 1. Start with Context & Visual Thesis

Inspect the product, design system, existing components, routes, content, and target platforms before proposing a direction. Establish:

- primary users, tasks, and page/flow purpose;
- required content, actions, and signature moments;
- desired character, emotional tone, and aspects of the existing product that must remain recognizable;
- existing tokens (`@/components/core/*`, `@/components/forms/*`) and reusable components;
- responsive, localization (`tr`/`en`), accessibility, and performance constraints;
- loading, empty, error, success, disabled, selected, and destructive/permission states.

Ask only for missing information that would materially change the design. Otherwise, state reasonable assumptions and proceed.

## 2. Experience & Layout Principles

1. Define the information hierarchy and primary action using proportion, spacing, contrast, and typography before adding decoration.
2. Arrange content in the order users need it, not the order the data model exposes it.
3. Make dense information scannable through grouping, alignment, and progressive disclosure.
4. Preserve calm default states; reserve emphasis for meaningful actions and information.
5. Make system status and consequences visible, especially for destructive or irreversible actions.
6. Design keyboard, touch, pointer, and assistive-technology behavior together.
7. Treat responsive behavior as recomposition rather than uniform desktop shrinking.

## 3. Visual System & Craft

- Reuse existing tokens and components before introducing new variants; keep one-off composition local.
- Use a restrained set of distinctive motifs consistently rather than many unrelated effects.
- Avoid defaulting to excessive gradients, glass effects, glow, oversized type, floating cards, or gratuitous animation.
- Preserve readable line lengths, sufficient contrast (WCAG AA), and predictable alignment.
- Use motion to clarify state, continuity, or feedback; respect `prefers-reduced-motion`.
- Ensure touch targets, `focus-visible` states, labels, and error messages remain perceivable.

## 4. Implementation & Quality Pass

When code changes are requested, follow the repository's framework and `AGENTS.md` conventions. Preserve semantic HTML, progressive enhancement, and native control behavior.

Avoid mock data or polished happy paths that conceal missing states. Review at representative viewport sizes with realistic content, long labels, narrow screens, zoom/text scaling, keyboard flow, contrast, motion preferences, and failure conditions.

## Completion

Deliver the implemented interface or design specification, explaining the visual thesis (when applicable), important decisions, affected states, reuse of existing patterns, and any unresolved product choices. Do not present untested assumptions as research findings.
