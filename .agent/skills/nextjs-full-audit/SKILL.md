---
name: nextjs-full-audit
description: Full audit of a Next.js project (security, performance, SEO, accessibility, code quality, architecture, reliability, dependencies, PWA/Service Worker, Firebase if present). Use when the user asks to audit, review, check, analyze or "denetle" a Next.js codebase, or types /nextjs-full-audit. Produces a prioritized AUDIT_REPORT.md. Read-only unless the user explicitly asks for fixes.
---

# Next.js Full Audit

You are performing a complete, evidence-based audit of a Next.js codebase. Your job is to find real problems, prove them with file paths and line numbers, rank them by impact, and give concrete fixes. Do not pad the report with generic advice that is not tied to this codebase.

## Modes

The user may pass an argument. Default is `full`.

| Argument   | Scope                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `full`     | All phases 0–8                                                                                                                                                                                                                  |
| `quick`    | Phase 0, Phase 1, then only Critical/High checks from phases 2–8                                                                                                                                                                |
| `security` | Phases 0, 1 (audit + build only), 2, 8                                                                                                                                                                                          |
| `perf`     | Phases 0, 1, 3                                                                                                                                                                                                                  |
| `seo`      | Phases 0, 4                                                                                                                                                                                                                     |
| `a11y`     | Phases 0, 5                                                                                                                                                                                                                     |
| `quality`  | Phases 0, 1, 6, 7                                                                                                                                                                                                               |
| `fix`      | Read the existing `AUDIT_REPORT.md` and fix findings in severity order, one finding per commit-sized change, re-running checks after each. Do not create git commits automatically unless the user explicitly asks for commits. |

## Ground rules

1. **Read-only by default.** Do not edit source files, install packages into the project, change lockfiles, or run `npm audit fix` unless mode is `fix` or the user explicitly asks. Never run `npm audit fix --force`. Writing `AUDIT_REPORT.md` and generating `.next/` build output during Phase 1 are the only allowed filesystem writes; if `next build` mutates tracked files like `next-env.d.ts` or `tsconfig.tsbuildinfo`, note or restore them so the working tree stays clean.
2. **Evidence or it didn't happen.** Every finding needs: file path, line number(s) or config key, a short code excerpt or command output, and why it is a problem. If you are unsure, mark it `Needs verification` instead of asserting it.
3. **No false confidence on versions/CVEs.** Your knowledge of security advisories may be outdated. If you can access the web, check the official Next.js security advisories (`github.com/vercel/next.js/security/advisories`) and the React advisories against the exact installed versions. If you cannot, say so in the report and list the installed versions so the user can verify.
4. **Use the project's package manager** (detect from lockfile: `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`/`bun.lock`, `package-lock.json`; flag if multiple lockfiles exist). Always pass non-interactive flags (`npx --yes`, `pnpm --package=... dlx`, `bunx`) for one-off tools so CLI prompts never hang the session; never install globally.
5. **Don't leak secrets.** If you find secrets, report the file and variable name and mask the value (`sk_live_****abcd`).
6. **Be proportionate.** A personal project does not need SOC2 advice. Scale recommendations to what the project actually is (detected in Phase 0).
7. **Write the report in the language the user is writing in.** Code, file paths and identifiers stay as-is.

---

## Phase 0 — Reconnaissance

Collect and record in the report header:

- Next.js, React, TypeScript, Node versions (`package.json`, lockfile/installed resolved versions in `node_modules`, `.nvmrc`, `engines`)
- Project-specific engineering rules: check for `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, or `tasks/lessons.md` and record mandatory project constraints (e.g. max lines per file, forbidden raw HTML primitives, required form/validation wrappers, i18n folder conventions)
- Router: App Router (`app/`), Pages Router (`pages/`), or mixed; `src/` layout or not
- Rendering mix: static, SSR, ISR, client-only; `output` setting in `next.config.*` (e.g. `export`, `standalone`)
- Backend/data: Firebase, Supabase, Prisma/Drizzle, REST/GraphQL clients, CMS
- Auth: NextAuth/Auth.js, Clerk, Firebase Auth, custom JWT/session
- Deployment target: Vercel (`vercel.json`), Firebase Hosting (`firebase.json`, `apphosting.yaml`), Docker, other
- Styling/UI: Tailwind, CSS modules, component libraries
- i18n setup, middleware/proxy file (`middleware.ts` or `proxy.ts`), `instrumentation.ts`, Service Worker (`public/sw.js`)
- Test setup, CI config (`.github/workflows`), lint/format config
- Size: number of routes, components, approximate LOC

Build a short **route map**: every route, whether it is server/client, static/dynamic, and every Route Handler (`route.ts`) and Server Action (`'use server'`). This map drives phases 2 and 3.

---

## Phase 1 — Automated checks

Run what applies, capture output (trim noise), and record pass/fail. If a command fails because of missing setup (e.g. missing env vars), note it and continue. Always use `--yes` with `npx` to avoid interactive install prompts.

```bash
# Types
npx --yes tsc --noEmit

# Lint (use the project's script if it exists)
<pm> run lint            # or: npx --yes next lint / npx --yes eslint .

# Tests (if present and fast)
<pm> test

# Production build — record warnings, static/dynamic markers
<pm> run build

# Dependency vulnerabilities (report only, do not fix)
<pm> audit               # npm audit --omit=dev for runtime-only view

# Outdated dependencies
<pm> outdated

# Unused files / exports / dependencies
npx --yes knip --no-progress   # fall back to: npx --yes depcheck

# Circular imports (optional, if src is large)
npx --yes madge --circular --extensions ts,tsx ./src   # or ./app
```

Optional, only if the build succeeds and the user's environment allows starting the app:

```bash
<pm> run start &         # or next start on a free port
npx --yes lighthouse http://localhost:3000 --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lighthouse.json --chrome-flags="--headless"
```

Run Lighthouse against the 2–4 most important routes from the route map. If it cannot run, skip and say so (and clean up `./lighthouse.json` if created).

Bundle analysis:

- If `@next/bundle-analyzer` is configured, run it.
- On Webpack builds (`next build --webpack` or Next.js ≤ 15), use the route-size table from `next build` output and flag routes with unusually large First Load JS.
- On Next.js 16+ (Turbopack default, where `next build` no longer prints a per-route First Load JS size table), inspect `.next/static/chunks/` (`ls -lhS .next/static/chunks/ | head -n 20`) and `.next/build-manifest.json` / client component imports to identify oversized chunks (> ~150 KB uncompressed).

---

## Phase 2 — Security

### 2.1 Framework & dependency vulnerabilities

- Compare installed `next`, `react`, `react-dom` versions to official advisories (see ground rule 3). Pay special attention to: middleware/proxy authorization bypass advisories, React Server Components / Server Functions advisories (remote code execution, DoS, source exposure), `'use cache'` / `unstable_cache` cross-tenant leakage, and `next/og` / image optimization / cache poisoning advisories.
- Summarize `audit` output: only runtime-relevant High/Critical in the main findings; the rest in an appendix.
- Note: upgrading `react` alone does not patch Next.js; Next bundles its own RSC runtime. The fix is upgrading `next`.

### 2.2 Secrets & environment variables

- Grep for hardcoded keys/tokens/passwords/private keys in source, config, and `.env*` files. Verify via `git ls-files` and `git log` that `.env` / `.env*.local` and service-account JSON files are not and were never committed.
- Check for dangerous fallback defaults in auth/demo flags (e.g. `ALLOW_DEMO_AUTH !== 'false'` failing open when undefined, hardcoded fallback `JWT_SECRET`, or silent production fallback to an in-memory store).
- Every `NEXT_PUBLIC_*` variable ends up in the client bundle. Flag any that look secret (`SECRET`, `PRIVATE`, `SERVICE_ROLE`, `ADMIN`, `API_KEY` for paid server APIs).
- Server-only modules (DB clients, admin SDKs, secret-using utils, in-memory server stores) must import `'server-only'` at top-level so accidental client import fails the build.
- Is there env validation (e.g. zod/t3-env) at startup? Missing validation = Medium.

### 2.3 Server Actions & Route Handlers (highest-risk surface)

For **every** Server Action and Route Handler in the route map:

- **Authentication:** is the user's session verified _inside_ the action/handler? Middleware/proxy alone is not sufficient — Server Actions and Route Handlers are reachable directly.
- **Authorization:** does it check the user may act on _this_ resource (ownership/role)? Look for IDs taken from input and used without an ownership check (IDOR) or unvalidated foreign-key references (`categoryId`, `locationId`, `listId`).
- **Input validation:** is input validated with a schema (zod/valibot) before use (body, query params, and dynamic path params)? Check that malformed JSON in `req.json()` returns `400 Bad Request` rather than `500 Internal Server Error`.
- **Return values:** does it return more data than needed (full DB rows, raw session tokens in JSON bodies alongside `httpOnly` cookies, raw upstream provider responses, internal errors/stack traces)?
- **Rate limiting** on auth, account deletion, file upload, email-sending, AI/paid-API, and write-heavy endpoints. Verify the rate limiter cannot be trivially bypassed via spoofed leftmost `X-Forwarded-For` headers or unbounded in-memory Map growth.
- **HTTP methods:** Route Handlers export only the methods they need.

### 2.4 Middleware / proxy

- Is `middleware.ts` / `proxy.ts` used as the _only_ auth gate? (Flag: High.) Auth must also be enforced at the data/route layer.
- Check the `matcher` and early-return conditions (`isStaticAsset`, `/api/`) for gaps (missing routes, CSP headers skipped on `/api/*` or metadata routes, static-asset patterns like `pathname.includes('.')` that may be too broad).
- Redirect logic: open redirects via `?next=`, `?redirect=`, `callbackUrl`, or return-route cookies without strict path allow-listing.

### 2.5 Data exposure, client persistence & Service Worker cache

- Props passed from Server Components to Client Components are serialized to the browser. Flag whole DB/user objects passed down when only a few fields are used.
- **Client storage & session lifecycle:** flag raw JWTs or sensitive data persisted in `localStorage` (`zustand/middleware` persist, etc.) when `httpOnly` cookies are already used, and check whether server-side token revocation exists on logout / account deletion.
- **Service Worker & Cache Storage (`public/sw.js`) / IndexedDB:** if a Service Worker caches authenticated `/api/*` responses or offline mutations are stored in IndexedDB, verify that logout and account deletion explicitly purge both Cache Storage (`caches.delete(...)`) and IndexedDB so sensitive data never leaks across sessions on the same browser.
- Check for sensitive data in `generateMetadata`, JSON-LD, or HTML comments.

### 2.6 XSS & injection

- `dangerouslySetInnerHTML`: is the content sanitized (e.g. DOMPurify) or strictly validated against CSS/HTML injection (e.g. dynamic `<style>` tags)?
- User-controlled `href`/`src`/image URLs: ensure Zod schemas reject `javascript:` and `data:text/html` URIs and restrict outbound URLs where SSRF or third-party probing is possible.
- File uploads: check MIME type, file size limit, magic-byte signature verification, and storage bucket access controls.
- Raw SQL string building, `eval`, `new Function`, `child_process` with user input.

### 2.7 HTTP security headers & config

- `next.config.*` `headers()` vs `middleware.ts` / `proxy.ts`: check for conflicting headers (e.g. `X-Frame-Options: SAMEORIGIN` in `next.config.*` vs `DENY` in `proxy.ts`), Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. If a per-request CSP `nonce` is generated in `proxy.ts`, verify whether it is actually read and applied in `layout.tsx`.
- `poweredByHeader: false`.
- `images.remotePatterns`: wildcards like `hostname: '**'` allow abuse of the image optimizer. `dangerouslyAllowSVG` without a strict CSP.
- Production source maps (`productionBrowserSourceMaps: true`) exposing source.
- Cookies: `httpOnly`, `secure`, `sameSite` on session cookies.
- CORS headers on API routes: `Access-Control-Allow-Origin: *` with credentials.

### 2.8 Firebase (only if detected)

- `firestore.rules` / `storage.rules` / `database.rules.json`: flag `allow read, write: if true`, `if request.auth != null` used without ownership check, or `storage.rules` missing file size (`request.resource.size`) and MIME type (`request.resource.contentType`) validation when client Firebase SDK is enabled.
- Firebase Admin SDK (`firebase-admin`): verify it imports `'server-only'`, validates credentials in production (never silently falling back to an in-memory mock store when env vars are misconfigured), and never exposes service-account credentials to client code.
- App Check enabled for client-callable services? (Info/Low unless abuse is plausible.)
- Client SDK writes that should be server-side (pricing, roles, entitlements, subscription status).

---

## Phase 3 — Performance

### 3.1 Server/client boundaries

- `'use client'` placed too high (on layouts, page wrappers, or entire landing page trees) pulling static sections into the client bundle or rendering duplicate mobile/desktop DOM trees simultaneously. Recommend pushing `'use client'` down to leaf interactive components.
- Heavy libraries (charts like `recharts`, command palettes like `cmdk`, QR generators, AI modals/assistants, rich editors) imported statically in client components without `next/dynamic`.
- Barrel-file imports (`import { X } from '@/components'` or from large libraries) that defeat tree-shaking; check `optimizePackageImports`.

### 3.2 Data fetching

- Waterfalls & client request storms: pages firing 5–8 simultaneous client `useEffect` / React Query requests on mount after hydration instead of server prefetching or aggregated dashboard endpoints; sequential `await`s that are independent → `Promise.all`.
- Redundant fetches: Server Component passing `initialData` to a Client Component that immediately re-fetches the same endpoint on mount because `initialData` wasn't wired into React Query, or calling the same Firestore collection query twice in the same `Promise.all` (e.g. `listItems(uid)` and `listItems(uid, true)`).
- Missing `<Suspense>` / `loading.tsx` or missing `isLoading` skeleton states (flashing empty `0` states before client queries resolve).
- Duplicate calls to request-scoped helpers (`getCurrentLocale()`, `getAuthenticatedUser()`) across `generateMetadata`, layouts, and pages within one request without `React.cache()`.
- Backend N+1 or full-collection scans in Route Handlers (e.g. loading an entire collection into memory just to update a single document by ID).

### 3.3 Caching & rendering strategy

- Determine the caching model in use for the installed version (fetch cache options, `revalidate`, `unstable_cache`, or Cache Components / `'use cache'` with `cacheLife`/`cacheTag`). Use the version-appropriate APIs in recommendations.
- Routes that are dynamic only because of an accidental dynamic API usage (`cookies()`, `headers()`, `searchParams`) and could be static/ISR.
- Missing `generateStaticParams` for content routes that could be pre-rendered.
- Over-revalidation (very low `revalidate`) or no invalidation path after mutations (`revalidatePath`/`revalidateTag` missing after writes).
- Service Worker (`public/sw.js`) intercepting non-cached navigation requests with no-op `fetch` wrappers that add SW wake-up overhead.

### 3.4 Assets

- `<img>` instead of `next/image`; `next/image` without `sizes` on responsive images; missing `priority`/`preload` on the LCP image.
- Fonts not loaded via `next/font` (layout shift, extra requests).
- Third-party scripts not using `next/script` with an appropriate `strategy`.
- Large static files in `public/` (images > ~300 KB, unoptimized video).

### 3.5 Client runtime

- Unnecessary re-renders: unstable inline objects/functions passed to memoized children, context providers whose value changes every render, state lifted too high.
- Large lists without virtualization or server pagination.
- `useEffect` used for derived state.

Cross-reference with Phase 1 build output / chunk sizes and Lighthouse metrics (LCP, CLS, INP/TBT) where available.

---

## Phase 4 — SEO & metadata

- Root `metadata` / `generateMetadata` per route: title, description, `metadataBase`, canonical (`alternates.canonical`), Open Graph and Twitter images.
- **Metadata inheritance traps:** check if authenticated/private pages export partial `metadata = { title, description }` objects that accidentally inherit `robots: { index: true, follow: true }` and `alternates: { canonical: '/' }` from the root layout instead of using the project's `noindex` auth metadata helper.
- **Title template duplication:** check if root `title.template` (e.g. `%s | Brand`) is combined with child titles that already include `Brand – ...`, producing `"Brand – Page | Brand"`.
- `app/sitemap.ts`, `app/robots.ts`, and `app/llms.txt/route.ts` (if present): verify that _all_ private/authenticated routes and `/api/` are listed in `disallow` / excluded paths, and that template placeholder descriptions do not remain.
- OpenGraph / Twitter image consistency: verify declared `width`/`height` match the actual image file dimensions and Twitter card type (`summary` vs `summary_large_image`).
- `hreflang` alternates if multilingual; `<html lang>` set correctly per locale.
- Structured data (JSON-LD) where relevant (SoftwareApplication, FAQPage, articles, products, organization, breadcrumbs).
- Proper `not-found.tsx` returning 404 (not a 200 soft-404); redirects using 301/308 where permanent.
- Content that should be indexable is server-rendered, not client-only.

---

## Phase 5 — Accessibility

- **Focus indicators (`focus-visible`):** check core interactive primitives (`Button`, `Link`, `Switch`, `TabsTrigger`, `BottomNav`, `DialogClose`, `SheetClose`) for `focus-visible:outline-none` or `outline-none` used _without_ a visible replacement `focus-visible:ring-*` (WCAG 2.4.7 failure).
- **Heading hierarchy:** verify every page renders exactly one `<h1>` (check if the shell header renders a `<BreadcrumbPage>` `<span>` instead of `<h1>`, leaving pages with no `<h1>`), and check for skipped heading levels.
- **Interactive elements & nested controls:** real `<button>`/`<a>` rather than clickable `<div>`; no interactive elements nested inside another `<button>` (e.g. a clear `<X onClick>` inside a DatePicker trigger `<Button>` with `[&_svg]:pointer-events-none`, or a `<Checkbox>` inside a sort `<button>`).
- **Form inputs & error association:** every input/select/textarea/datepicker trigger has an associated `<label htmlFor>` (matching the control's `id`), `aria-invalid` on error, and `aria-describedby` linking hint and error message IDs.
- **Color contrast:** check Lighthouse or theme/Tailwind classes (such as low-opacity muted text like `text-ash/60`) against WCAG AA (4.5:1 normal text, 3:1 large text/UI components).
- **Landmarks & Skip Link:** `<main id="main-content">`, `<nav>`, `<header>`, and verify `<SkipLink />` is actually mounted in the layout shell.
- **Dialogs/menus:** focus trap, `Esc` to close, correct ARIA roles (`aria-labelledby`, `aria-describedby`).
- `prefers-reduced-motion` respected for animations.

---

## Phase 6 — Code quality & architecture

- **Project Rules Compliance (`AGENTS.md` / `CLAUDE.md`):**
  - Check every constraint defined in the project's rules file (e.g. 250-line maximum per file, folder-with-`index.ts` modularization rule, prohibition of raw HTML primitives `<button>`/`<input>`/`<a>`/`next/link` outside `@/components/core/*`, mandatory `@/` path aliases over deep relative `../../` imports, mandatory `react-hook-form` + `zod` + `@/components/forms` for user inputs, and i18n JSON folder conventions). List all violating files with exact line counts or line numbers.
- **`tsconfig.json` & Type safety:** `strict` enabled? Count `any`, `as`, `@ts-ignore`, `@ts-expect-error`, non-null `!` assertions; list the worst files and unvalidated `as` casts on external/DB data.
- **Error handling:** `error.tsx`, `global-error.tsx` (required to catch RootLayout errors), `not-found.tsx` present; Route Handlers and Server Actions log and map errors consistently rather than swallowing them with bare `catch {}` or returning 500 on client syntax errors.
- **Data access & consistency:** is DB/API access centralized in a repository/service layer? Do all API routes use the standard route wrapper (`withApiRoute`) and return a consistent error shape (`{ message }` vs `{ error }`)?
- **Dead code & unused dependencies:** from `knip` output and cross-checks — unused files, unused core components, template leftovers (e.g. `example-service.ts`), unused i18n dictionaries, and production `dependencies` in `package.json` that are only imported by dead files.
- **Circular imports** from `madge`.

---

## Phase 7 — Reliability, DX & operations

- **Tests:** do they exist, what kind (unit/integration/e2e), do they cover auth, repositories, and critical business logic? Do they pass?
- **Package manager & lockfile hygiene:** check if multiple lockfiles exist (e.g. both `package-lock.json` and `yarn.lock`), which causes CI/local dependency drift.
- **CI/CD consistency:** does `.github/workflows/*` run type-check, lint, metadata check, test, audit, and build on PRs? Does the workflow filename match project documentation (`tasks/lessons.md` / `README.md`)?
- **Observability:** `instrumentation.ts`, error monitoring (Sentry etc.), structured server logs, request ID correlation (`x-request-id`); are errors logged without leaking PII/secrets?
- **`.env.example` completeness:** compare every `process.env.*` reference in `src/` against `.env.example` (flag undocumented env vars used in code and dead env vars in `.env.example` like unused `CRON_SECRET`).
- **README & scripts:** setup steps and scripts accurate? Empty route directories left behind?
- **Build warnings** from Phase 1 that indicate future breakage.

---

## Phase 8 — Upgrade readiness

- Gap between installed and latest stable Next.js/React and key runtime dependencies (e.g. `zod`, `firebase`, `firebase-admin`).
- List breaking changes relevant to _this_ codebase (e.g. async request APIs, caching default changes, `middleware` → `proxy` convention, Zod v3 → v4 migration for CVE fixes) — verify against official upgrade guides if web access is available.
- Codemods available: `npx @next/codemod@latest <transform>` — list which ones apply.
- Recommend an upgrade path (one major at a time) with risk notes.

---

## Severity & Scoring Rubric

| Level        | Meaning                                              | Examples                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | Exploitable now or data loss likely; fix immediately | Known RCE/auth-bypass in installed Next/React version; fail-open demo auth in production; silent fallback to volatile in-memory DB in production; unauthenticated write action; secret in client bundle                                                                                                                                                                                                   |
| **High**     | Serious risk or major user-facing impact             | Session JWT stored in `localStorage`; no token revocation on logout/account deletion; rate-limit bypass via `X-Forwarded-For` or missing rate limits on auth/upload/AI routes; unvalidated `storage.rules`; private pages indexed by search engines; missing keyboard focus rings across core buttons; 7-request client waterfall on dashboard; files violating mandatory project size/architecture rules |
| **Medium**   | Real problem, not urgent                             | Conflicting security headers between `next.config` and `proxy.ts`; unused CSP nonce; Service Worker cache not cleared on logout; missing `React.cache()` deduplication; zero `next/dynamic` on heavy charts/modals; missing `global-error.tsx`; dual lockfiles; unused dependencies                                                                                                                       |
| **Low**      | Improvement                                          | Minor a11y/SEO gaps (OG image dimensions, missing JSON-LD); non-null assertions; minor unused exports                                                                                                                                                                                                                                                                                                     |
| **Info**     | Observation, no action required                      | Architecture notes, positive findings                                                                                                                                                                                                                                                                                                                                                                     |

**Scoring Rubric (0–10 per area):**

- Any **Critical** finding in an area caps that area's score at **≤ 4/10**.
- Any **High** finding caps that area's score at **≤ 6/10**.
- Deduct points proportionally for multiple Medium/Low findings; reserve **9–10/10** for areas with zero Critical/High/Medium issues.

Effort: **S** (< 1h), **M** (half day), **L** (> 1 day).

---

## Report format

Write `AUDIT_REPORT.md` at the project root (or print it if you cannot write files). Structure:

````markdown
# Next.js Audit Report — <project name>

Date: <YYYY-MM-DD> · Mode: <mode> · Auditor: <agent name>

## Summary

- Stack: Next <ver> (<router>), React <ver>, TS <ver>, <backend>, <auth>, deployed on <target>
- Overall: <2–3 sentence verdict>
- Findings: Critical N · High N · Medium N · Low N · Info N

| Area                        | Score (0–10) | Top issue |
| --------------------------- | ------------ | --------- |
| Security                    |              |           |
| Performance                 |              |           |
| SEO                         |              |           |
| Accessibility               |              |           |
| Code quality & Architecture |              |           |
| Reliability/Ops             |              |           |
| Dependencies/Upgrade        |              |           |

## Top 5 fixes (do these first)

1. [CRITICAL][S] <title> — <file> — <one-line fix>
   ...

## Automated check results

| Check      | Result               | Notes |
| ---------- | -------------------- | ----- |
| tsc        | pass/fail (N errors) |       |
| lint       |                      |       |
| test       |                      |       |
| build      |                      |       |
| audit      |                      |       |
| knip       |                      |       |
| madge      |                      |       |
| lighthouse |                      |       |

## Findings

### SEC-001 · Critical · Effort S — <title>

- **Where:** `app/actions/delete-item.ts:12-30`
- **Evidence:**
  ```ts
  <short excerpt>
  ```
````

- **Why it matters:** <impact in one or two sentences>
- **Fix:**
  ```ts
  <concrete corrected code or config>
  ```
- **Verify:** <how to confirm the fix>

(IDs: SEC, PERF, SEO, A11Y, QUAL, OPS, DEP. Order by severity, then effort.)

## Positive findings

- <things done well — keep short>

## Not checked / needs verification

- <anything skipped and why; CVE checks done without web access; Lighthouse not run, etc.>

## Appendix

- Route map (Pages, Layouts, Server Actions, and all Route Handlers with Auth/Zod/RateLimit status)
- Full dependency audit output (trimmed)
- Outdated packages table

```

## Workflow summary

1. Phase 0 → inspect stack, project rules (`AGENTS.md`), and build the complete route map.
2. Phase 1 → run automated tools with non-interactive flags (`--yes`), keep outputs, and check working tree cleanliness.
3. Phases 2–8 per mode, using the route map so every Server Action, Route Handler, and page is covered — don't sample.
4. De-duplicate: one finding per root cause, listing all affected locations under it.
5. Write `AUDIT_REPORT.md`. Finish with a short chat summary: counts by severity, the Top 5 fixes, and the report path.
6. Ask whether to proceed with `fix` mode — do not start fixing on your own.
```
