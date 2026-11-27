---
name: brand-guidelines
description: Create, document, or consistently apply a brand system across product UI, marketing pages, campaigns, documents, and app store assets. Covers brand voice, tone, colour tokens, typography, iconography, motion personality, and compliance review.
---

# Brand Guidelines — Creation & Application

Establish a consistent brand identity or translate an existing brand system into concrete deliverables without inventing unsupported rules or flattening the needs of the target medium.

---

## 1. Applying an Existing Brand System (Workflow)

When brand guidelines already exist and the task is adaptation, implementation, or compliance review:

1. **Locate sources of truth:** brand guide, design tokens (`src/lib/design/tokens/`), component library (`@/components/core/`), approved assets (`public/brand/`), voice guide, and canonical examples.
2. **Identify target context:** deliverable, audience, channel, locale (`tr`/`en`), technical constraints, and accessibility requirements.
3. **Map brand rules before editing:**
   - _Identity:_ logo, marks, clear space, minimum size;
   - _Visual system:_ semantic color roles, typography, spacing, imagery, iconography, motion;
   - _Verbal system:_ voice, tone, terminology, capitalization, calls to action.
4. **Decision rules:**
   - Do not create a new brand direction when asked to apply an existing one.
   - Do not sample approximate colors, redraw logos, or substitute fonts when canonical assets/tokens exist.
   - Treat accessibility as a hard constraint: if an approved combination fails WCAG AA contrast (4.5:1), preserve brand intent and flag an accessible alternative.
   - Prefer semantic tokens (`brand-primary`, `text-muted`) over repeated literal values.
   - Adapt composition to the channel (web, mobile/PWA, email, social) while keeping recognizable brand attributes.

---

## 2. Brand Voice & Tone

Voice is fixed and reflects the same personality across all platforms and content types. Tone adjusts based on context.

### Defining the Voice Character

Define 3–5 adjectives with concrete "what it means / what it does not mean" pairs:

- **Trustworthy** — not arrogant (_"Your data is encrypted and stored securely"_ vs _"We are the most secure app on the market"_).
- **Clear** — not dry (_"Get started in three steps"_ vs _"The onboarding process offers an optimised experience"_).
- **Human** — not informal (_"Great — you've completed the first item"_ vs _"Yo! First task done"_).

### Tone Adjustment by Context

- **Success messages:** short, measured energy (_"Saved — you're ready."_).
- **Error messages:** non-blaming, solution-oriented, concise — state **what failed + likely reason + next action** (_"Payment failed. Check your card details and try again."_).
- **Onboarding:** welcoming, guiding, one step at a time (Headline + Body + single clear CTA).
- **Empty states:** hopeful and action-oriented (_"No items yet. Add your first one to get started."_).
- **Notifications:** lead with value; never manufacture fake urgency.

---

## 3. Visual Identity Standards

- **Colour Palette:** Define primary, secondary, and prohibited uses for each brand colour using semantic design tokens. Verify WCAG AA (≥ 4.5:1 for normal text, ≥ 3:1 for large text/UI).
- **Typography:** Define display (headings/marketing), body (lists/forms/descriptions), and mono (numbers/prices/tables/code) font roles.
- **Iconography & Imagery:** Keep a single icon style (outline or filled) with consistent stroke weight and padding. Maintain uniform lighting/framing for photography and corner-radius/palette alignment for illustrations.
- **Animation Personality:** Match motion to brand character — calm/minimal brands use subtle fade/ease-out transitions (200–300 ms); enterprise brands use measured curves (400–600 ms); always respect `prefers-reduced-motion`.

---

## 4. Consistency Checklist

Before finalizing any new screen, notification, or copy update:

- **Voice & Tone:** Aligned with brand adjectives, appropriate for context, free of blame or jargon.
- **Visual:** Approved assets and semantic tokens used; typography, icon style, and motion match the system; contrast and focus states remain usable.
- **Copy:** Clear value proposition and singular CTA; verified across supported locales and breakpoints.
