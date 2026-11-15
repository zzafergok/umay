# Umay – Uygulama Planı (`tasks/todo.md`)

## Faz 14 – Modern Responsive One-Page Anasayfa Revizyonu (İnceleme Özeti)

- **One-Page Üst Gezinme & Kaydırma:** `src/app/globals.css` içine `scroll-behavior: smooth` (`prefers-reduced-motion` uyumlu) eklendi; `src/features/routes/_shared/layouts/app-shell.tsx` ile `i18n/tr.json` ve `i18n/en.json` içinde masaüstü one-page bölüm bağlantıları (`#nasil-calisir`, `#omurlu-parcalar`, `#ozellikler`, `#ekranlar`, `#sss`) tanımlandı.
- **Modüler One-Page Bileşenleri (`src/features/routes/public/home/`):**
  - `HomeHero` (`home-hero.tsx`) & `HeroLivePreview` (`hero-live-preview.tsx`): İki kolonlu responsive hero düzeni ve `Tabs`, `StatusPill`, `Button` ile etkileşimli "Bugünün Ev Defteri" stok önizlemesi oluşturuldu.
  - `HowItWorksSection` (`how-it-works-section.tsx`): 3 adımlı responsive akış kartları eklendi.
  - `LifecycleCtaCard` (`lifecycle-cta-card.tsx`): `LifecycleProgressBar` ve `StatusPill` ile etkileşimli parça değişimi önizlemesi eklendi.
  - `FeatureInfoCards` (`feature-info-cards.tsx`) & `QuickRoutesSection` (`quick-routes-section.tsx`): `cat-1..cat-6` kategori noktalı 6 özellik kartı ve 5 hızlı ekran kartı bölüm çapalarıyla güncellendi.
  - `FaqSection` (`faq-section.tsx`) & `HomeFooterCta` (`home-footer-cta.tsx`): `@/components/core/accordion` tabanlı SSS ve kapanış CTA + altbilgi eklendi.
- **Standartlar & Doğrulama:** Tüm dosyalar 250 satır sınırının altında tutuldu (en uzun dosya 173 satır), yalnızca `@/components/core/*` bileşenleri kullanıldı ve `tr.json` / `en.json` sözlükleri güncellendi. `npm run type-check`, `npm run lint`, `npm test` (9 dosya, 80 test), `npm run metadata:check` ve `npm run build` hatasız tamamlandı.

---

## Faz 13 – Umay Tasarım Rehberi (`design.md`) Uygulaması (İnceleme Özeti)

- **Tek Kaynak & Modüler Tasarım Token'ları:** `docs/design.md` belgesi oluşturuldu. Tüm renkler (`--bg`, `--surface`, `--surface-raised`, `--surface-sunken`, `--border`, `--border-strong`, `--text`, `--text-muted`, `--text-subtle`, `--accent`, `--accent-hover`, `--accent-subtle`, `--on-accent`, `--ember`, durum token'ları ve `--cat-1`..`--cat-8`), tipografi ve boşluk ölçekleri `src/lib/design/tokens/` altına modüler olarak eklendi; `src/lib/design/contrast.ts` ve `src/lib/design/contrast.test.ts` (38 test) ile açık/koyu tema WCAG AA (≥ 4.5:1) kontrastları doğrulandı (`vitest.config.mts` `src/**/*.test.{ts,tsx}` içerecek şekilde güncellendi).
- **Tema, Font & CSS Altyapısı:** `src/lib/fonts.ts` (`Inter` `--font-body`, `Manrope` `--font-heading`, `JetBrains_Mono` `--font-mono`, `latin` + `latin-ext`), `src/app/layout.tsx`, `src/components/providers/theme-provider.tsx` (`defaultTheme="system"`, `enableSystem`), `src/app/globals.css` (RGB üçlüleri, `tabular-nums`, `prefers-reduced-motion` desteği), `src/app/typeset.css` ve `tailwind.config.mjs` (semantik renkler, `cat-*`, Tulpar uyumluluk takma adları, tipografi ölçeği, `6/10/14px` köşe yarıçapları, `shadow-float`) güncellendi.
- **Marka Varlıkları & PWA:** `public/brand/` (`umay-mark.svg`, `umay-wordmark.svg`, `umay-lockup.svg`), `public/umay-icon.svg`, `public/umay-logo.svg`, `src/components/shared/umay-brand.tsx` ve `src/app/manifest.ts` (`#FAF8F5` tema/zemin) oluşturuldu/güncellendi.
- **Çekirdek UI & Ekranlar:** `src/components/core/` bileşenleri (`button`, `input`, `textarea`, `label`, `badge`, `status-pill`, `progress`, `quantity-stepper`, `card`, `sheet`, `dialog`, `table`, `skeleton`, `empty`, `bottom-nav`, `stat`, `select/*`, `toast/*`), uygulama kabuğu (`application-shell`, `pwa-offline-provider`, `page-header`, `theme-toggle`), ekranlar (`home`, `items`, `parts`, `settings` 3 yönlü tema seçici, `public/home`) "sessizlik = iyi", istisna odaklı durum rozetleri ve 4 gruplu kart hiyerarşisine geçirildi.
- **Doğrulama:** `npm run lint`, `npm run type-check`, `npm test` (9 dosya, 83 test), `npm run metadata:check` ve `npm run build` hatasız tamamlandı.

---

## İnceleme Özeti (Önceki Fazlar)

- **Faz 0–1 (Keşif & Dönüşüm):** Tulpar mimarisi `docs/TULPAR-NOTES.md` ve varsayımlar `docs/ASSUMPTIONS.md` içinde belgelendi. Proje `umay` adına taşındı, `public/umay-logo.svg` ve PWA ikonları üretildi, `firebase.json`, `firestore.rules`, `firestore.indexes.json` ve `storage.rules` oluşturuldu.
- **Faz 2 (Tasarım Sistemi):** Semantik yüzey token'ları eklendi; `StatusPill`, `Stat`, `QuantityStepper` ve `BottomNav` çekirdek bileşenleri geliştirildi; `/design` vitrini ve mobil alt gezinmeli `AuthShell` kuruldu.
- **Faz 3 (Auth & Veri Katmanı):** `.env` ve `.env.example` Firebase Google Auth + Firestore + Emulator yapılandırmasıyla hazırlandı; `signInWithGooglePopup` + `/api/auth/firebase` + `uid` kapsamlı `/api/inventory/*` uç noktaları ve atomik repository katmanı yazıldı.
- **Faz 4–8 (Özellikler):** Konumlar (`/locations`), Kategoriler (`/categories`), Ürünler (`/items`, `/items/[id]`, görsel sıkıştırma, QR etiket), Alışveriş Listesi (`/shopping`), Ömürlü Parçalar (`/parts`, `/parts/[id]`, 2 dokunuşla değişim ve yedek stok düşümü, `/api/jobs/refresh-parts`), Panel (`/home`), Barkod/QR Tarayıcı (`/scan`), Komut Paleti (`Ctrl/⌘+K`), Faaliyet & Bildirimler (`/activity`) ve Ayarlar/CSV-JSON Yedekleme (`/settings`) tamamlandı.
- **Faz 9 (PWA, Seed, Test & Belgeleme):** `public/sw.js`, IndexedDB çevrimdışı yazma kuyruğu (`offline-queue.ts`), `scripts/seed.ts`, repository/lifecycle/isolation testleri ve `README.md` tamamlandı.

---

## Faz 10 – OpenRouter Provider Altyapısı ve Fiş Analizi (İnceleme Özeti)

- **OpenRouter Provider (`src/lib/ai/openrouter/`):** Güncel OpenRouter `/api/v1/chat/completions` ve `/api/v1/models` istek/yanıt/hata tipleri (`types.ts`), ücretsiz vision+text model listesi ve fallback sırası (`constants.ts`, `models.ts`), `.env` yapılandırması (`config.ts`) ve HTTP 200 içi `error` payload'larını da yakalayan `createOpenRouterChatCompletion` istemcisi (`client.ts`) kuruldu.
- **Fiş Analizi (`src/lib/ai/receipt-analyzer/`):** Fiş görselinden hem ham OCR metni (`rawText`) hem de yapılandırılmış market/tarih/tutar/ürün kalemleri çıkaran Zod şemaları (`schemas.ts`), Türkçe odaklı sistem/kullanıcı prompt'ları (`prompt.ts`), dayanıklı JSON/virgül-ondalık ayrıştırıcı (`parser.ts`) ve otomatik ücretsiz model fallback zinciri (`analyzer.ts`) yazıldı.
- **API & Servisler:** `/api/ai/openrouter/models` (`GET`), `/api/ai/receipt/analyze` (`POST`) ve `src/services/ai-receipt-service.ts` eklendi; `.env.example` içinde `OPENROUTER_API_KEY` belgelendi.
- **UI Yardımcı Bileşeni & Entegrasyon:** `src/components/ai/receipt-assistant/` bileşeni `@/components/core/*` ve `@/components/core/table` ile oluşturulup `/shopping` ekranına (`shopping-receipt-card.tsx`) bağlandı.
- **Doğrulama:** `src/lib/ai/__tests__/openrouter-receipt.test.ts` (6 test) dahil tüm Vitest testleri, `npm run type-check`, `npm run lint` ve `npm run build` hatasız geçti.

---

## Faz 11 – Proje Geneli Umay Tasarım Sistemi, Renk Token'ları ve Tipografi Revizyonu (İnceleme Özeti)

- **Tipografi (`layout.tsx`, `tailwind.config.mjs`, `globals.css`, `typeset.css`):** `Space_Grotesk` (`--font-display`), `Inter` (`--font-sans`) ve `JetBrains_Mono` (`--font-mono`) fontları `next/font/google` ile doğru CSS değişkenlerine bağlandı; `globals.css` içindeki mükerrer Google Fonts `@import` kaldırıldı ve `h1..h6` başlıklarına `font-display` eklendi.
- **Global Renk Token'ları (`globals.css`, `tailwind.config.mjs`):** `tulpar-blue`, `tulpar-gold`, `tulpar-firuze`, `tulpar-cosmic` ve `.tulpar-glow-radial` token'ları mevcut ölçek formatında `umay-blue`, `umay-gold`, `umay-firuze`, `umay-cosmic` ve `.umay-glow-radial` olarak yenilendi; tüm `50..950` ölçekleri `:root` ve `.dark` bloklarına eklendi.
- **Proje Geneli Geçiş & Doğrulama:** `src/` altındaki 87 dosya ve `theme-provider.tsx` (`storageKey="umay-theme"`) yeni `umay-*` token'larına geçirildi; `npm run type-check`, `npm run lint`, `npm test` (7 dosya, 41 test) ve `npm run build` hatasız tamamlandı.

---

## Faz 12 – Dark / Light Tema Token Uyumluluğu ve Revizyonu (İnceleme Özeti)

- **`globals.css` & `tailwind.config.mjs` Token Eşitleme:** `globals.css` içindeki `:root` ve `.dark` bloklarına eksik `--primary` / `--primary-50..900` değişkenleri eklendi; `.glass-panel` sabit `rgba(15, 20, 25, 0.5)` yerine tema duyarlı `hsl(var(--obsidian) / 0.72)` ve `hsl(var(--gunmetal) / 0.6)` token'larına taşındı. `tailwind.config.mjs` içindeki tanımsız `--accent-50..900`, `--blue-*`, `--teal-*`, `--error`, `--info` ve eklenti yardımcı sınıfları (`.text-gradient`, `.glass-effect`, `.btn-primary`, `.card-modern`) temizlenip `globals.css` ile uyumlu `primary`, `secondary`, `accent`, `destructive`, `danger`, `error`, `info`, `surface`, `surface-raised` ve `umay-accent` eşlemeleriyle güncellendi.
- **Tema Duyarlı Çekirdek ve Düzen Bileşenleri:** `bg-obsidian`, `bg-void-black` ve `bg-gunmetal` gibi temaya göre açık/koyu değişen yüzeylerde light modda okunmazlığa yol açan sabit `text-white` / `hover:text-white` / `border-white/30` sınıfları (`dialog`, `drawer`, `sheet`, `empty`, `toaster`, `toast-item`, `sidebar-*`, `dropdown-menu-*`, `context-menu-*`, `command`, `combobox-*`, `toggle`, `carousel`, `accordion-trigger`, `date-picker/calendar`, `data-table-column-header`, `attachment-actions`, `application-shell`, `select-field`) `text-titanium` / `text-foreground` / `border-foreground/20` token'larına geçirildi; `badge` (`warning` varyantı `text-ink-950`) ve `switch` (light modda `bg-ash/45` iz rengi) kontrastları iyileştirildi.
- **Doğrulama:** `npm run type-check`, `npm run lint`, `npm test` (7 dosya, 41 test) ve `npm run build` hatasız tamamlandı.
