# Umay – Uygulama Planı (`tasks/todo.md`)

## Faz 18 – OpenRouter OpenAPI Spesifikasyonuna Tam Uyum (İnceleme Özeti)

- **OpenAPI Tip Tanımları (`src/lib/ai/openrouter/model-types.ts`, `types.ts`):**
  - `ModelsListResponse`, `ModelResponse` (`OpenRouterSingleModelResponse`), `ModelsCountResponse` (`OpenRouterModelsCountResponse`), `PublicPricing` (`discount`, `image_token`, `overrides`), `ModelReasoning`, `ModelBenchmarks`, `ReasoningEffort` (including `max`) ve `GET /models` / `GET /models/user` query parametreleri OpenRouter OpenAPI 3.1.0 şemasıyla birebir uyumlu hale getirildi.
- **OpenRouter İstemci & Katalog Fonksiyonları (`src/lib/ai/openrouter/models.ts`, `request.ts`, `constants.ts`, `query-params.ts`, `next-route.ts`):**
  - `limit=500` varsayılanı kaldırıldı; `fetchOpenRouterModels()`, `aiReceiptService.listModels()` ve `useReceiptAssistant` `limit`/`offset` göndermeden OpenRouter'ın tam listesini çeker (varsa `links.next` sayfalarını da otomatik birleştirir) ve tüm OpenAPI `/models` query parametrelerini destekler.
  - `fetchOpenRouterModelsCount` (`GET /models/count`), `fetchOpenRouterUserModels` (`GET /models/user`, API key zorunlu) ve `fetchOpenRouterModelBySlug` (`GET /model/{author}/{slug}`, `:free` varyantı ve alias çözümleme) eklendi; tüm `GET` çağrıları `requestOpenRouterGet` ve `parseOpenRouterErrorPayload` ile birleştirildi.
- **Next.js API Route'ları & Uygulama Katmanı:**
  - `GET /api/ai/openrouter/models`, `GET /api/ai/openrouter/models/count`, `GET /api/ai/openrouter/models/user` ve `GET /api/ai/openrouter/model/[author]/[slug]` passthrough uç noktaları `openrouter/next-route.ts` üzerinden kuruldu.
  - `src/lib/ai/receipt-analyzer/model-catalog.ts` (`:free`, `openrouter/free`, `pricing.discount === 1` ve sıfır fiyatlı tüm ücretsiz modellerin tam kapsanması), `analyzer.ts` (`resolveMissingPreferredModel` ile alias/eksik model detayı çekme) ve `src/services/ai-receipt-service.ts` (`listModels`, `getModelsCount`, `getUserModels`, `getModelBySlug`) güncellendi.
  - `/shopping` ekranına özel opsiyonel `modelQuery?: OpenRouterModelsQueryParams` ve `defaultFreeOnly?: boolean` desteği (`ReceiptAssistant`, `useReceiptAssistant`, `getOpenRouterModelsQueryKey`) eklendi; [shopping-receipt-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-receipt-card.tsx) üzerinden `input_modalities: 'text,image'`, `output_modalities: 'text'`, `endpoints: '/api/v1/chat/completions'` sorgusu ve `defaultFreeOnly={true}` aktif edildi. `isFreeOpenRouterModel` tüm `pricing` alanları `0` (veya `discount: 1`) olan ücretsiz modelleri (`11 ücretsiz` vision → text) listeleyecek şekilde sıkılaştırıldı.
- **Doğrulama:**
  - İlgili tüm dosyalar `<= 250` satır (`wc -l`, `receipt-assistant/*` en uzun dosya `use-receipt-assistant.ts` 237 satır).
  - `npm run type-check`, `npm run lint`, `npm test` (13 test dosyası, 102 test) ve `npm run build` sıfır hata ile geçti.
  - Canlı doğrulama: `GET /api/ai/openrouter/models` (limitsiz tam liste) `HTTP 200` (`435` model, `17` ücretsiz metin modeli); `/shopping` sorgusu (`?input_modalities=text,image&output_modalities=text&endpoints=/api/v1/chat/completions`) `HTTP 200` (`242` vision->text chat modeli, `11` ücretsiz vision->text modeli) döndürdü.

---

## Faz 17 – OpenRouter Ham Yanıtlarını Olduğu Gibi Kabul Etme ve Uygulama Yapısını Uyarlama (İnceleme Özeti)

- **OpenRouter Servisi (Passthrough):**
  - `src/lib/ai/openrouter/models.ts` (`fetchOpenRouterModels`) ve `src/app/api/ai/openrouter/models/route.ts` (`GET`) OpenRouter `GET /api/v1/models?limit=500` yanıtını (`{ data, total_count, links, ... }`) hiçbir filtreleme, alan kırpma veya yeniden eşleme yapmadan olduğu gibi döndürür (`X-OpenRouter-Configured` header'ı ile).
  - `src/lib/ai/openrouter/types.ts` ve `src/lib/ai/openrouter/client.ts` gerçek OpenRouter model ve `/chat/completions` yanıt alanlarını (`canonical_slug`, `hugging_face_id`, `architecture`, `pricing`, `top_provider`, `supported_parameters`, `default_parameters`, `endpoints`, `reasoning`, `reasoning_details`, `cost_details`, `is_byok` vb. + `[key: string]: unknown`) tam olarak kabul eder.
- **Uygulama Katmanı Uyarlaması (`src/lib/ai/receipt-analyzer/`, `src/services/ai-receipt-service.ts`):**
  - `model-catalog.ts`: Görsel/chat uygunluğu, ücretsiz/ücretli ayrımı, bağlam/fiyat formatlama ve varsayılan model seçimi ham `OpenRouterModel` alanları üzerinden uygulama katmanında yapılır.
  - `analyzer.ts` & `response-extract.ts`: `fetchOpenRouterModels()` verisini tüketir, OpenRouter'ın maksimum 3 model sınırı için fallback gruplarını 3'erli gönderir, `supportsJsonObject` bayrağına göre `response_format` yönetir ve `content`, `reasoning`, `reasoning_details`, `refusal`, `finish_reason`, `native_finish_reason`, `id`, `provider`, `usage`, `rawResponse` alanlarını kayıpsız saklar.
  - `parser.ts`, `normalizers.ts` & `schemas.ts`: `camelCase`/`snake_case` ve alternatif alan adlarını, `₺`/`TL` para birimini, sayısal/Türkçe `confidence` değerlerini ve Türkçe ondalık sayıları normalize eder; JSON parse edilemeyen yanıtlarda hata atmak yerine tam metni `rawText` olarak sunar.
  - `ai-receipt-service.ts`: Ham `OpenRouterModelsResponse` tipini tüketir.
- **UI Katmanı (`src/components/ai/receipt-assistant/`):**
  - `receipt-assistant-utils.ts`, `use-receipt-assistant.ts` & `receipt-model-selector.tsx`: Ham `data: OpenRouterModel[]` listesini okuyarak ücretsiz/tüm modeller filtresi (`freeOnly` Switch), bağlam/fiyat/akıl yürütme bilgisi ve tek istekli `refreshModels` akışı sunar.
  - `receipt-result-meta.tsx` & `receipt-result-view.tsx`: Güven seviyesi, sağlayıcı, token kullanımı, ara toplam/KDV/indirim/ödeme yöntemi ve `Model Yanıtı` (`reasoning` + `rawResponse`) sekmesi gösterir.
- **Doğrulama:** İlgili tüm dosyalar `<= 250` satır (`wc -l`, en uzun dosya 229 satır). `npm run type-check`, `npm run lint`, `npm test` (12 test dosyası, 96 test), `npm run build` ve canlı `GET http://localhost:3000/api/ai/openrouter/models` (`HTTP 200`, `data` 435 model, `total_count: 435`, `links`) başarıyla doğrulandı.

---

## Faz 16 – Hatırlatıcı ve Yedekleme Yapılarının Sistem Genelinden Kaldırılması (İnceleme Özeti)

- **Silinen API Uç Noktaları ve Bildirim Altyapısı:**
  - `src/app/api/inventory/backup/route.ts`, `src/app/api/inventory/notifications/route.ts`, `src/app/api/inventory/notifications/[id]/route.ts`, `src/app/api/jobs/refresh-parts/route.ts` ve `src/lib/inventory/notification-channel.ts` kaldırıldı.
- **Tip, Şema, Repository ve Servis Temizliği:**
  - `src/features/inventory/types/lifecycle.ts` & `src/features/inventory/schemas/lifecycle-schemas.ts`: `Part.reminderLeadDays`, `NotificationType`, `InventoryNotification`, `UserSettings.defaultReminderLeadDays` ve `UserSettings.notifyInApp` kaldırıldı.
  - `src/lib/auth/auth-schema.ts`: `userSettingsSchema` içinden `emailUpdates` alanı kaldırıldı.
  - `src/lib/lifecycle/index.ts`: `computePartHealth` içindeki `reminderLeadDays` bağımlılığı kaldırılıp sabit `DEFAULT_DUE_SOON_DAYS = 7` eşiği kullanıldı.
  - `src/lib/inventory/memory-store.ts`, `src/lib/inventory/repo/shopping-settings-repo.ts` (`shopping-notification-repo.ts` yerine) & `src/lib/inventory/repo/index.ts`: Bildirim deposu, `refreshPartsForUser` ve bildirim ayar varsayılanları temizlendi; alışveriş listesi ve kullanıcı ayarları (`currency`, `dateFormat`) korundu.
  - `src/services/inventory-service.ts`, `src/hooks/use-inventory-hooks.ts` & `scripts/seed.ts`: `listNotifications`, `markNotificationRead`, `refreshParts`, `exportBackup`, `useNotificationsQuery` ve seed `reminderLeadDays` alanı kaldırıldı.
- **Arayüz, Metadata ve i18n Güncellemeleri (Ömürlü yedek parça / yedek stok mantığı korundu):**
  - `src/features/routes/auth/settings/`: `backup-export-card.tsx` kaldırılıp yalnızca hızlı bağlantıları içeren `QuickToolsCard` (`src/features/routes/auth/settings/components/quick-tools-card.tsx`) eklendi; `AuthSettingsForm` içindeki hatırlatıcı anahtarı kaldırıldı ve `types.ts`, `i18n/tr.json`, `i18n/en.json` güncellendi.
  - `src/features/routes/auth/profile/`: `ProfileSessionCard` ve `ProfileDangerZoneCard` içindeki yedekleme yönlendirmeleri kaldırıldı; `types.ts`, `i18n/tr.json`, `i18n/en.json` güncellendi.
  - `src/features/routes/auth/activity/screen.tsx` & `src/app/(auth)/activity/page.tsx`: Bildirim Merkezi kartı kaldırıldı; sayfa başlık ve açıklaması `Faaliyet Günlüğü` olarak güncellendi.
  - `src/features/routes/auth/home/screen.tsx` & `src/features/routes/auth/parts/part-form-dialog.tsx`: `refreshParts()` / `useNotificationsQuery()` çağrıları ve `Hatırlatma (Gün önce)` girişi kaldırıldı.
  - `src/features/routes/_shared/layouts/i18n/{tr,en}.json`, `src/lib/metadata/site-metadata/dictionaries/{tr,en}.json`, `src/components/shared/account-actions/i18n/{tr,en}.json` ve `src/features/routes/public/home/i18n/{tr,en}.json` yedekleme/bildirim metinlerinden arındırıldı.
- **Doğrulama & Firebase Yayınlama:**
  - Tüm değiştirilen/eklenen dosyalar 250 satır sınırının altında doğrulandı (en uzun dosya: `part-form-dialog.tsx`, 208 satır).
  - `npm run type-check`, `npm run lint`, `npm test` (11 test dosyası, 93 test), `npm run metadata:check` ve `npm run build` sıfır hatayla geçti.
  - [firestore.rules](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/firestore.rules) (`notifications` açıklaması kaldırıldı) ve [firestore.indexes.json](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/firestore.indexes.json) (`notifications` bileşik indeksi kaldırıldı) güncellenip doğrulandı; `umay-d5bb8` Firebase projesine `firestore` hedefiyle başarıyla yayınlandı (5 indeks `CREATING` durumunda).
  - [storage.rules](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/storage.rules) sözdizimi doğrulamasından geçti ancak `umay-d5bb8` projesinde varsayılan Storage bucket henüz oluşturulmadığı (`No active Storage rules were found in project 'umay-d5bb8'`) için `storage` yayını başarısız oldu.

---

## Faz 15 – Hesap Yönetimi Servisleri (Çıkış Yap, Hesabı Sil), Butonlar ve Profil Ekranı (İnceleme Özeti)

- **Sunucu Uç Noktaları & Veri Temizliği:**
  - `src/lib/auth/auth-schema.ts`: `profileUpdateSchema` (`name`), `deleteAccountSchema` (`confirmEmail`) ve `createDeleteAccountSchema` Zod doğrulamaları eklendi.
  - `src/lib/inventory/repo/account-repo.ts`: `deleteAllUserData(uid)` ile bellek deposu (`clearMemoryStore`), Firestore `/users/{uid}` alt koleksiyonları (`recursiveDelete`) ve Firebase Storage `users/{uid}/` dosyaları temizlenecek şekilde eklendi.
  - `src/app/api/auth/me/route.ts`: `GET` ve `PATCH` (profil adı güncelleme, Firebase Auth `displayName` güncelleme ve yeni JWT/cookie oturumu üretme) eklendi.
  - `src/app/api/auth/account/route.ts`: `DELETE` (oturum kontrolü, Zod + e-posta eşleşme doğrulaması, kullanıcı verilerinin ve Firebase Auth kaydının silinmesi, `destroySession()`) eklendi.
- **İstemci Servisleri, Store ve Hook Katmanı:**
  - `src/lib/api/client.ts`: `/api` taban URL normalizasyonu eklendi.
  - `src/lib/firebase/client.ts` & `src/lib/offline/offline-queue.ts`: `signOutFirebaseClient()` ve `clearOfflineMutations()` eklendi.
  - `src/stores/use-auth-store.ts`: Cookie tabanlı oturumlar için `setUser` aksiyonu eklendi.
  - `src/services/auth-service.ts` & `src/hooks/use-auth-hooks.ts`: `/auth/*` yollarına hizalandı; `useCurrentUserQuery`, `useUpdateProfileMutation`, `useLogoutMutation` ve `useDeleteAccountMutation` eklendi.
  - `src/features/routes/public/home/components/google-signin-button.tsx`: `isAuthUser` tip koruyucusu API yanıtındaki `{ id, email, name, role }` yapısına uyarlandı.
- **Yeniden Kullanılabilir Hesap Butonları & Kabuk Entegrasyonu (`src/components/shared/account-actions/`):**
  - `LogoutButton`, `DeleteAccountButton`, `DeleteAccountDialog` (`Form` + `TextField` + `SubmitButton` ile e-posta doğrulamalı), `UserAccountMenu` ve `SidebarUserFooter` oluşturuldu.
  - `AppShellLayout`, `CommandPalette`, `src/features/routes/_shared/layouts/i18n/*` ve `src/features/routes/auth/settings/` (`/settings` içinde gerçek profil/ayar kaydı + `AccountActionsCard`) ile entegre edildi.
- **Profil Ekranı (`/profile`):**
  - `src/lib/metadata/site-metadata/` (`authProfile`), `src/app/(auth)/profile/page.tsx` ve `src/features/routes/auth/profile/` (`ProfileOverviewCard`, `ProfileEditForm`, `ProfileSessionCard`, `ProfileDangerZoneCard` + `tr.json`/`en.json`) oluşturuldu.
- **Doğrulama & Açık Noktalar:**
  - `tests/auth/auth-schema.test.ts`, `tests/auth/account-routes.test.ts`, `tests/inventory/repository.test.ts` ve `tests/i18n/i18n-dictionaries.test.ts` güncellendi/eklendi.
  - `npm run type-check`, `npm run lint`, `npm test` (10 dosya, 90 test), `npm run metadata:check` ve `npm run build` hatasız tamamlandı. Canlı Firebase projesi/emülatörü üzerinde gerçek uçtan uca kimlik silme doğrulaması ise ortam yapılandırmasına bağlıdır (yerel birim testleri mock/bellek deposu ile doğrulandı).

---

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
