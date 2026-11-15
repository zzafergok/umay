# Tulpar Şablonu İnceleme Notları

Bu belge, **Umay** uygulamasının üzerine inşa edildiği Tulpar Next.js 16 şablonunun mimari, bileşen ve standart inceleme özetini içerir.

## 1. Teknoloji Yığını

- **Framework:** Next.js 16.3.5 (App Router, Turbopack), React 19.2.1, TypeScript 5.7.3 (`strict: true`).
- **Stil & UI:** Tailwind CSS 3.4.17, `radix-ui` (birleşik paket + `@radix-ui/react-slot` / `@radix-ui/react-compose-refs`), `lucide-react`, `framer-motion`, `next-themes`, `class-variance-authority`, `cmdk`, `vaul`.
- **Durum & Veri:** Zustand v5 (`persist`), TanStack React Query v5, `react-hook-form` + `@hookform/resolvers` + `zod` (v3.25).
- **Test & Kalite:** Vitest 4, ESLint 9 (`eslint-config-next`), Prettier + `prettier-plugin-tailwindcss`, `scripts/check-route-metadata.mjs`.

## 2. Dizin ve Mimari Katmanları

- `src/app/`: App Router rotaları `(public)`, `(auth)`, `(admin)` ve `api/` Route Handler'ları.
- `src/features/routes/`: Sayfa görünümleri ve rota kabukları (`_shared/layouts` içinde `AppShellLayout` ve `AdminAppShellLayout`, `public/`, `auth/`, `admin/`).
- `src/components/core/`: 40+ atomik UI bileşeni (`button`, `input`, `card`, `badge`, `table`, `progress`, `empty`, `command`, `stepper`, `sidebar`, `dialog`, `drawer`, `sheet`, `select`, `tabs`, `skeleton`, `toast` vb.).
- `src/components/forms/`: `react-hook-form` + `zod` uyumlu form alanları (`TextField`, `TextareaField`, `SelectField`, `DateField`, `AmountField`, `CheckboxField`, `SwitchField`, `RadioField`, `ChoiceCardField`, `FileField`, `SubmitButton`).
- `src/components/shared/`: `CompactControl`, `DeleteConfirmationDialog`, `EnterpriseErrorBoundary`, `StandardCard`.
- `src/lib/api/`: `apiClient` (Bearer token enjeksiyonu, timeout/abort, 401 otomatik oturum temizleme, `ApiError`).
- `src/lib/auth/`: `jwt.ts` (token imzalama/doğrulama), `session.ts` (`httpOnly` cookie yardımcıları), `auth-schema.ts`, `demo-credentials.ts`.
- `src/lib/i18n/` & `src/lib/metadata/`: TR/EN yerelleştirme ve `metadata:check` ile denetlenen dinamik/statik rota metadata üreticileri.
- `src/services/` & `src/hooks/`: `CACHE_STRATEGIES` (`REALTIME`, `SHORT`, `MEDIUM`, `LONG`), `useApiQuery`, `useApiMutation`.
- `src/proxy.ts`: Next.js rota koruması (`/home`, `/admin` yönlendirmeleri), locale başlığı enjeksiyonu ve HTTP güvenlik başlıkları.

## 3. Tema ve Tasarım Sistemi

- **Dark-mode-first** yaklaşım; `tailwind.config.mjs` ve `globals.css` içinde `tulpar-blue`, `void-black`, `obsidian`, `gunmetal`, `titanium`, `ash` renk token'ları tanımlı.
- Açık/koyu tema `next-themes` (`attribute="class"`) ve `ThemeToggle` ile yönetiliyor.
- Sert çizgili, yüksek kontrastlı, bilgi yoğunluğu yüksek endüstriyel/brutalist karakter.

## 4. Kalite Kuralları (`AGENTS.md`)

- Dosya başına maksimum **250 satır**; aşan modüller `klasör/` + `index.ts` (barrel) yapısına bölünür.
- Feature kodunda ham HTML primitive (`<button>`, `<input>`, `<table>` vb.) yasak; `src/components/core` ve `src/components/forms` zorunlu.
- Yalnızca `@/...` path alias; göreceli `../../` yasak.
- TypeScript'te `any`, zorlayıcı `as`, `@ts-ignore` yasak.
