# Umay – Uygulama Planı (`tasks/todo.md`)

## İnceleme Özeti

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
