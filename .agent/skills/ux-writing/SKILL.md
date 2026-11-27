---
name: ux-writing
description: UX writing guide for web, PWA, and mobile application interface copy (microcopy). Covers headings, buttons, error messages, empty states, form labels, helper text, confirmation dialogs, and notifications. Use when writing or auditing UI text in English or Turkish.
---

# UX Writing — Web, PWA & Mobile Microcopy Guide

> Every word is a decision. The right word moves the user forward; the wrong word stops them, confuses them, or creates anxiety.

## 1. Four Core Principles

Run every new piece of UI copy through four checks:

1. **Purposeful:** Helps the user finish a task rather than filling space.
2. **Concise:** Communicates the same meaning in fewer words (especially in narrow mobile viewports and table headers).
3. **Conversational:** Sounds like a helpful human, not a stack trace or legal contract.
4. **Clear:** Unambiguous action, outcome, and next step.

## 2. Copy Patterns

### Headings & Titles

- State what the screen or section helps the user do; match the navigation label that led there.
- Avoid generic titles (`Settings` -> `Account & notifications`; `Details` -> `Subscription details`).

### Buttons & Actions (Verb + Noun)

- Prefer specific action labels (`Save changes`, `Delete project`, `Export CSV`) over vague ones (`Submit`, `OK`, `Yes`).
- Destructive confirmation dialogs must name the action, not repeat `Cancel` / `OK` (`Keep item` vs `Delete item`).
- Use **sentence case** consistently; avoid forced `ALL CAPS` transformations (especially important for Turkish `i`/`İ`/`ı`/`I` casing).

### Error Messages (What happened + Why + How to fix)

- Never expose raw error codes, stack traces, or blame the user.
- Be specific and actionable:
  - Bad: `Invalid input (422)`
  - Good: `Enter a valid email address, such as name@example.com.`
  - Turkish: `Geçersiz tarih aralığı. Bitiş tarihi başlangıç tarihinden sonra olmalıdır.`

### Empty States (Explain value + Give 1 clear next step)

- First-use empty state: explain what belongs here and offer the primary creation CTA.
- Filtered/search empty state: explain why nothing matched and offer a quick `Clear filters` action.
- Zero-inbox / completion state: confirm briefly without noisy badges.

### Form Labels, Placeholders & Helper Text

- **Label:** Concise noun phrase (`Email address`, `Birim fiyat`). Always visible outside the input.
- **Placeholder:** Optional format example (`ornek@alanadi.com`), never the sole carrier of required rules because it disappears on focus.
- **Helper text:** Specific constraints shown upfront (`PDF or PNG up to 5 MB`).

### Loading, Success & Notifications

- Active progress: present continuous (`Saving changes...`, `Analiz ediliyor...`).
- Toast / feedback: confirm the completed action concisely (`Changes saved`, `Ayarlar güncellendi`).
- Never use manipulative guilt-tripping copy in opt-outs or confirmations.
