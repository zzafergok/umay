# Güvenlik, Rate Limiting, API Route Wrapper ve CI Pipeline Özeti

## Yapılan Değişiklikler

- **Gerçek HS256 JWT İmzalama ve Fail-Closed Secret Politikası** ([jwt.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/auth/jwt.ts), [jwt.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/auth/jwt.test.ts)): `node:crypto` üzerinden `createHmac('sha256')` ve `timingSafeEqual` ile standart HS256 imza doğrulamasına geçildi; `alg=HS256` kontrolü, UTF-8 `base64url` kodlama ve production'da `JWT_SECRET` zorunluluğu eklendi.
- **Dinamik Nonce Tabanlı CSP** ([csp.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/security/csp.ts), [proxy.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/proxy.ts), [next.config.mjs](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/next.config.mjs), [csp-http.test.mjs](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/security/csp-http.test.mjs), [proxy.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/auth/proxy.test.ts)): Statik CSP kaldırılıp sayfa isteklerinde her istekte dönen `nonce` tabanlı `Content-Security-Policy` başlığı eklendi (`upgrade-insecure-requests` yalnızca production'da).
- **Sabit Pencere Rate Limiting Altyapısı** ([src/lib/rate-limit](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/rate-limit/index.ts), [rate-limit-window.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/lib/rate-limit-window.test.ts)): `evaluateRateLimitWindow`, `consumeRateLimit` ve `resolveClientIp` ile `auth_login`, `auth_register`, `ai_receipt_analyze` ve `ai_receipt_enrich` politikaları tanımlandı.
- **Standardize API Route Wrapper (`withApiRoute`)** ([src/lib/api/server](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/api/server/index.ts), [api-route-handler.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/lib/api-route-handler.test.ts)): Auth, Zod body doğrulama, rate limiting, `x-request-id` ve hata eşleme tek merkezde toplandı; `/api/auth/login`, `/api/auth/register`, `/api/ai/receipt/analyze` ve `/api/ai/receipt/enrich` uç noktalarına entegre edildi.
- **CI Güvenlik & Kalite Pipeline'ı** ([security.yml](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/.github/workflows/security.yml)): Node 22 ile `npm audit`, `type-check`, `lint`, `metadata:check`, `test`, `build` ve canlı sunucu CSP doğrulaması eklendi.

## Doğrulama Sonuçları

- `npm run type-check`: Başarılı (0 hata)
- `npm run lint`: Başarılı (0 hata)
- `npm run metadata:check`: Başarılı (`All app routes expose metadata.`)
- `npm test`: Başarılı (27 test dosyası, 167/167 test geçti)
- `npm run build`: Başarılı (`next build` hatasız tamamlandı)

---

# Çoklu Görsel ile Uzun Fiş Analizi, Reasoning Token Kontrolü ve Yarıda Kesilen JSON Kurtarma Özeti

## Kök Neden Analizi (Canlı OpenRouter Testleriyle Doğrulandı)

1. **Dinamik Fiyatlı (`-1`) Router Modellerin Ücretsiz Havuzuna Karışması ve `400` Hatası**:
   - `openrouter/auto-code`, `openrouter/auto`, `openrouter/fusion` gibi karar/yönlendirme (router) modellerinin fiyatları OpenRouter kataloğunda `prompt: "-1", completion: "-1"` olarak döndüğü için `isFreeOpenRouterModel` içinde `numeric > 0` kontrolü bu modelleri ücretsiz kabul ediyordu.
   - Bu router modeller çoklu `models: [...]` dizisinde birleştiğinde OpenRouter `400 Bad Request: "The decisions router cannot be combined with another router model"` hatası döndürüyordu.
2. **Muhakeme (Reasoning) Modellerinin Tüm Token Bütçesini Düşünme Aşamasında Tüketmesi**:
   - `nvidia/nemotron-3.5-super-vl:free` ve `meta/muse-spark-1.2` gibi modellerde `reasoning: { effort: 'low' }` gönderildiğinde bile model 10.000–16.000 token'ı `message.reasoning` içinde tüketip `message.content` alanını boş (`null`) bırakıyordu.
   - `reasoning: { enabled: false }` gönderildiğinde ise model `0` reasoning token harcayarak doğrudan yapılandırılmış JSON çıktısını (`message.content`) üretiyor (`google/gemini-4-*` gibi reasoning zorunlu modellerde ise otomatik `reasoning: { effort: 'low' }` fallback'i uygulanıyor).
3. **Kredi Bakiyesi (`~$0.02`) ve Uzun Fişlerde `rawText` Tekrarı**:
   - Ücretli `google/gemini-4-hydrogen` modelinde ($7.50/1M completion) çok yüksek `max_tokens` değeri OpenRouter'ın ön-bütçe kontrolünde (`in_flight_budget_exhausted`) `402 Payment Required` hatasına düşüp yedek modele geçmesine neden oluyordu.
   - Ayrıca ~50–65 satırlık uzun fişlerde tüm ürün satırlarının hem `"items"` içinde hem de `"rawText"` içinde ikinci kez yazılması yanıt boyutunu ikiye katlıyordu.

## Yapılan Değişiklikler

- **Dinamik Fiyatlı Router Filtresi ve İzole Model Gruplama ([model-catalog.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/model-catalog.ts), [batch-request.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/batch-request.ts), [constants.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/openrouter/constants.ts))**:
  - `isFreeOpenRouterModel` içinde yalnızca maliyeti tam `0` olan modeller ücretsiz kabul edilerek `-1` dinamik fiyatlı router modeller ücretsiz listesinden çıkarıldı.
  - `isRouterModelId` kontrolü ile router modellerin (`openrouter/*` vb.) çoklu `models` dizisinde başka modellerle birleştirilmesi engellendi.
  - Varsayılan ücretsiz vision modeli olarak çoklu görselde yüksek doğruluk sağlayan `nvidia/nemotron-3.5-super-vl:free` önceliklendirildi; yanıt vermeyen/404 dönen `inclusionai/ling-3.2-flash:free` ve `baidu/ernie-5.5-flash-preview:free` geri plana alındı.
- **Muhakeme (Reasoning) Devre Dışı Bırakma & Zorunlu Reasoning Fallback ([batch-request.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/batch-request.ts), [analyzer.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/analyzer.ts))**:
  - Hibrit reasoning modellerinde `reasoning: { enabled: false }` gönderilerek modelin düşünme aşamasında token tüketmesi tamamen engellendi; `google/gemini-4-*` veya `"Reasoning is mandatory"` dönen uç noktalarda ise otomatik olarak `reasoning: { effort: 'low' }` ile devam ediliyor.
  - `contentText` boş ve `reasoning` içinden JSON ayrıştırılamıyorsa yanıt kabul edilmeyip sıradaki model grubuna geçiliyor.
- **Global Searchable Select Mimari Geliştirmesi (>4 Seçenekte Otomatik Arama) ([select-primitives.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/core/select/select-primitives.tsx), [select-items.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/core/select/select-items.tsx), [select-search-header.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/core/select/select-search-header.tsx), [select-search-utils.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/core/select/select-search-utils.ts))**:
  - Uygulama genelindeki tüm `<SelectContent>`, `<NativeSelect>` ve `<SelectField>` bileşenlerinde eleman sayısı **4'ten fazla (`> 4`)** olduğunda otomatik olarak üstte sabitlenen (sticky) arama kutusu (`SelectSearchHeader`) aktifleşiyor (`searchable` ve `searchThreshold` prop'larıyla özelleştirilebilir).
  - Türkçe karakter duyarsız (`tr-TR` + diacritic folding: `ç->c, ğ->g, ı->i, ö->o, ş->s, ü->u`) ve çoklu kelime (token) destekli arama motoru hem seçenek metnini (`children`), hem sağdaki fiyat/rozet eklentisini (`endAdornment`), hem de `value` / `searchValue` alanlarını tarıyor.
  - Radix Select'in seçili etiketi (`SelectValue`) kaybetmemesi için eşleşmeyen `<SelectItem>` elemanları DOM'dan unmount edilmek yerine `hidden` (`data-search-hidden="true"`) ile gizleniyor; klavye olayları (`onKeyDown` stopPropagation, `ArrowDown` ile ilk sonuca odaklanma, `Escape` ile sorgu temizleme) Radix typeahead çakışmalarından tamamen izole edildi.
- **Metin Çıkarımı (OCR) Uyumlu Vision Model Filtresi & `Tümü / Ücretsiz / Ücretli` 3'lü Toggle ([model-catalog.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/model-catalog.ts), [use-receipt-models.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/use-receipt-models.ts), [receipt-model-selector.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-model-selector.tsx))**:
  - `isVisionTextModel` güçlendirilerek OpenRouter `/models` yanıtındaki video/görsel üretim modelleri (`google/gemini-omni-1.2-flash`, `google/gemini-nano-banana-2.1` vb. `output_modalities` içinde `video`/`image` bulunan veya `/api/v1/videos`, `/api/v1/images` endpoint'i olanlar), `~` yönlendirme alias'ları (`tokenizer: "Router"`), `scaledown/*` gibi yalnızca `["max_tokens"]` destekleyen özel pipeline uç noktaları, `:batch` modelleri, `guard` sınıflandırıcıları ve `-1` dinamik fiyatlı kod router'ları (`openrouter/auto-code` vb.) elendi.
  - Model seçici (`ReceiptModelSelector`) içindeki eski `Sadece Ücretsiz` anahtarı yerine, uyumlu OCR modellerini sayı rozetleriyle birlikte filtreleyen **`Tümü (N)` / `Ücretsiz (N)` / `Ücretli (N)`** 3'lü toggle yapısı eklendi.
- **İngilizce AI Promptları & Türkçe Açıklama Yorumları ([prompt.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/prompt.ts))**:
  - AI modellerinin kuralları daha yüksek doğrulukla uygulaması için `RECEIPT_SYSTEM_PROMPT` ve `buildReceiptUserPrompt` metinleri İngilizceye çevrildi; Türkçe karşılıkları dosya içinde JSDoc yorum satırı (`/** ... */`) olarak korundu.
  - Çıktı şemasındaki Türkçe ürün adları (`normalizedName`), birimler (`adet`, `kg`, `l`, `paket`) ve kategori etiketleri (`Gıda`, `İçecek`, `Temizlik` vb.) uygulama arayüzüyle tam uyumlu kalacak şekilde İngilizce prompt içinde açıkça tanımlandı.
- **Kesişen Fotoğraf Bloğu (Overlap) ile Fişteki Gerçek Tekrarların Ayrımı ([prompt.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/prompt.ts), [deduplicate.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/deduplicate.ts), [analyzer.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/analyzer.ts))**:
  - Yalnızca birden fazla fotoğraf gönderildiğinde (`imageUrls.length > 1`) iki fotoğrafın kesiştiği ortak fiziksel bölge (en az 2 farklı ürün içeren ardışık tekrar bloğu) tespit edilip atlanıyor.
  - Fişin kendi üzerinde kasiyer tarafından birden fazla kez okutulmuş/basılmış tekrar eden ürün satırları (ör. alt alta veya ayrı satırlarda geçen aynı ürünler) kesinlikle silinmiyor ve birleştirilmiyor; olduğu gibi ayrı kalemler halinde korunuyor.
- **Yarıda Kesilen (Truncated) JSON Kurtarma ([json-repair.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/json-repair.ts), [parser.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/parser.ts))**:
  - Yanıt token sınırında kesilse bile `"items": [...]` içinde tamamlanmış tüm `{ ... }` ürün nesnelerini ve mağaza/toplam verilerini kurtaran `repairTruncatedReceiptJson` katmanı eklendi.
- **Deterministik Ürün Tutarı, Genel Toplam ve Toplam KDV Hesaplaması & Sadeleştirilmiş Fiş Özeti ([prompt.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/prompt.ts), [parser.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/parser.ts), [analyzer.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/analyzer.ts), [receipt-result-meta.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-result-meta.tsx), [receipt-result-view.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-result-view.tsx), [shopping-detail-dialogs.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-detail-dialogs.tsx))**:
  - Fiş altındaki kafa karıştırıcı hediye çeki/indirim/kredi kartı dip toplamlarından etkilenmemek için AI prompt'u üst/alt bilgiden yalnızca **tarih (`date` / `time`)**, **para birimi (`currency`)** ve varsa **KDV toplamı (`taxTotal`)** okuyacak şekilde sadeleştirildi.
  - Her ürün kaleminin satır tutarı `normalizeReceiptItem` içinde `quantity * unitPrice` formülüyle deterministik olarak hesaplanıyor ve tabloda tutarın altında `adet × birim fiyatı` rozeti (`Badge`) olarak gösteriliyor.
  - Fiş genel toplamı (`grandTotal`) tüm ürün kalemlerinin (`items`) KDV dahil `totalPrice` değerleri toplanarak kod tarafında (`computeTotalsFromItems`) deterministik olarak hesaplanıyor; toplam KDV (`taxTotal`) ise kod tarafında yeniden hesaplanmayıp doğrudan fiş üzerindeki `TOPKDV` / KDV dilimleri tablosundan okunan değer olarak referans alınıyor.
  - Alt alta tekrar eden özdeş ürün bloklarında (ör. 4 adet `ULKER PROBIS SAND.75 *26,25`) barkod satırındaki `*-B` birim fiyatları ile sağ kenardaki `*<Tutar>` değerlerinin yarattığı göz yanılsamasını (+1 fazla sayımı) önlemek için hem `prompt.ts` içine özel sınırlandırma/sayım ve `ARA TOPLAM` öz-kontrol kuralı, hem de `deduplicate.ts` içine `reconcileConsecutiveRunsWithAraToplam` deterministik mutabakat katmanı eklendi.
  - Fiş özet başlığında (`ReceiptResultMeta`) kafa karıştırıcı tüm ek rozetler ve AI notları kaldırılarak yalnızca **Tarih**, **Toplam** (ürünler toplamı) ve **Toplam KDV** gösteriliyor; modal genişliği de yatay kaydırmayı önlemek için `sm:max-w-2xl md:max-w-3xl` olarak büyütüldü.

- **2 Aşamalı Hızlı Fiş Analizi & Adım Adım İlerleme Göstergesi ([enrich.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/enrich.ts), [route.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/app/api/ai/receipt/enrich/route.ts), [receipt-progress.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-progress.tsx), [use-receipt-progress.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/use-receipt-progress.ts), [receipt-enrich-client.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-enrich-client.ts), [finalize.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/finalize.ts), [reconcile.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/ai/receipt-analyzer/reconcile.ts))**:
  - Vision aşamasında `normalizedName` ve `categoryHint` alanları kaldırılarak uzun fiş yanıt boyutu ve zaman aşımı riski azaltıldı; analiz bütçesi `170 sn` (`MAX_SINGLE_CALL_MS = 120 sn`, istemci `200 sn`, route `maxDuration = 200`) olarak yapılandırıldı.
  - Fiş okunduktan hemen sonra `POST /api/ai/receipt/enrich` uç noktası ile ham ürün adları okunaklı Türkçe ürün adlarına ve sabit kategorilere (`RECEIPT_CATEGORY_HINTS`) dönüştürülüyor (hata durumunda ham adlar güvenle korunuyor).
  - `ReceiptProgress` bileşeni ile analiz sırasında adım adım (`Fiş görselleri okunuyor` → `Toplamlar doğrulanıyor` → `Ürün adları ve kategoriler düzenleniyor`) canlı ilerleme çubuğu ve süre sayacı gösteriliyor; ara toplam uyuşmazlığında `ReceiptResultMeta` içinde uyarı gösteriliyor.
  - `receipt-result-view.tsx` 250 satır sınırının altına çekilmek üzere ham metin/yanıt sekmeleri `receipt-result-raw-tabs.tsx` bileşenine ayrıldı.

- **Tekil ve Toplu (Bulk) Alışveriş Kalemi Ekleme ([lifecycle-schemas.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/schemas/lifecycle-schemas.ts), [shopping-settings-repo.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/shopping-settings-repo.ts), [route.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/app/api/inventory/shopping/route.ts), [inventory-service.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/services/inventory-service.ts), [shopping-receipt-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-receipt-card.tsx), [use-shopping-screen.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/use-shopping-screen.ts))**:
  - `POST /api/inventory/shopping` uç noktası hem tekil `ShoppingItemInput` gövdesini hem de `{ items: ShoppingItemInput[] }` toplu ekleme gövdesini (1–500 öğe) destekleyecek şekilde genişletildi.
  - Repository katmanında `createShoppingItemsBulk` (ortak `buildShoppingEntry` yardımcısı ve Firestore `db.batch()` 500'lük yığın yazımı) ile toplu kayıtlar tek seferde işleniyor.
  - Fişten aktarma (`ShoppingReceiptCard`) ve toplu öneri ekleme (`useShoppingScreen`) akışları `inventoryService.createShoppingBulk` üzerinden **tek bir** servis isteği atacak şekilde güncellendi; ağırlıklı kalem miktarları (`0.375`, `3.44`) yuvarlanmadan 3 ondalık hassasiyetle korunuyor.
- **Binlik Ayırıcılı Fiyat (`1.044,75`) Ayrıştırma Düzeltmesi ([shopping-utils.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-utils.ts), [shopping-edit-dialog.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-edit-dialog.tsx))**:
  - `AmountField` binlik ayırıcı ürettiğinde (`1.044,75`) eski `parseOptionalPrice` yalnızca `,` -> `.` yaptığı için `Number("1.044.75")` `NaN` dönüyor ve düzenleme formunda `estimatedPrice: null` gönderiliyordu; `parseOptionalPrice` hem TR (`1.044,75`, `1.044`) hem EN/JS (`1044.75`, `1,044.75`) formatlarını destekleyecek şekilde güncellendi, `ShoppingEditDialog` başlangıç değeri de `formatAmountInput` ile hizalandı.
- **Tablo Üzerinden Toplu (Bulk) Alındı / Geri Al Yönetimi ([route.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/app/api/inventory/shopping/route.ts), [shopping-settings-repo.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/shopping-settings-repo.ts), [use-shopping-mutations.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/use-shopping-mutations.ts), [shopping-list-table.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-list-table.tsx))**:
  - `PATCH /api/inventory/shopping` (`{ ids, done }`) ve `updateShoppingItemsBulk` (Firestore `db.batch()`) eklendi; `useShoppingMutations` üzerinden bağlı stok hareketleri de yalnız durum değiştiren kalemler için işleniyor.
  - Tablonun `Alındı` başlık hücresine master `<Checkbox>` (indeterminate destekli) ve tablo araç çubuğuna `Tümünü Alındı İşaretle (N)` / `Alındı İşaretini Kaldır (N)` aksiyonu eklendi.
- **Alındı İşaretlenen Kalemlerin Ürünler Ekranına Otomatik Eklenmesi & Alan Eşitleme ([shopping-sync-repo.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/shopping-sync-repo.ts), [shopping-settings-repo.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/shopping-settings-repo.ts), [shopping-product-fields.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-product-fields.tsx), [shopping-form-schema.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-form-schema.ts))**:
  - `ShoppingListItem` şemasına `Item` ile uyumlu eksik detay alanları (`locationId`, `type`, `minQuantity`, `brand`, `model`, `barcode`, `currency`, `expiresAt`) eklendi; alışveriş listesindeki mevcut fazlalık alanlar (`priority`, `listId`, `source`, `estimatedPrice`, `note`) olduğu gibi korundu.
  - Tekil veya toplu `done: true` geçişlerinde `syncShoppingEntriesToInventory` devreye girerek bağlı/aynı isimli ürünün stoğunu artırıyor, Ürünler ekranında henüz olmayan kalemler için otomatik yeni `Item` (gerekirse kategori/konum da oluşturarak) yaratıp `itemId` bağlantısını kaleme kaydediyor.

## Doğrulama Sonuçları

- Tüm kaynak ve test dosyaları 250 satır sınırının altında (`analyzer.ts`: 217, `batch-request.ts`: 204, `deduplicate.ts`: 189, `json-repair.ts`: 171, `model-catalog.ts`: 240, `parser.ts`: 242, `prompt.ts`: 81, `receipt-result-meta.tsx`: 39, `receipt-result-view.tsx`: 246 satır).
- `npm test` (20 test dosyası, 135 test) ve `npm run type-check` sıfır hata ile geçti.

---

# `/home` Profesyonel Dashboard & Grafik Refactoring Özeti

- **Detaylı KPI Özet Kartları (`DashboardKpiGrid` & `KpiCardShell`)**:
  - **Toplam Envanter**: Toplam ürün, toplam birim rozeti, tahmini envanter değeri (`formatCurrency`), aktif oran çubuğu ve `Aktif / Konum / Kategori` alt kırılımı.
  - **Stok Sağlığı**: Sağlıklı stok yüzdesi, ilerleme çubuğu ve `Tükendi / Düşük / Yeterli` 3'lü durum kırılımı.
  - **Parça & Bakım**: Toplam parça, toplam bakım/değişim maliyeti, parça sağlığı oranı ve `Geciken / Yaklaşan / Normal` kırılımı.
  - **Alışveriş & SKT**: Bekleyen alışveriş kalemi, tahmini sepet tutarı, tamamlanma oranı ve `Tamamlanan / Acil / SKT-Garanti` kırılımı.
- **Etkileşimli Grafikler (`@/components/core/chart` + Recharts)**:
  - **Stok Hareket Trendi (`StockActivityChart`)**: Son 14 günün günlük stok giriş ve çıkış/tüketim hareketlerini gösteren çift serili `AreaChart`.
  - **Kategori Dağılımı (`CategoryDistributionCard`)**: Merkezinde toplam ürün sayısını gösteren `PieChart` (Donut) + kategori renkli alt liste.
  - **Konum Dağılımı (`LocationDistributionCard`)**: En yoğun 6 konumu ürün çeşidine göre sıralayan yatay `BarChart`.
- **Doğrulama**: Tüm dosyalar 250 satır sınırının altında (`home-utils.ts`: 199, `dashboard-kpi-grid.tsx`: 207, `stock-activity-chart.tsx`: 160, `category-distribution-card.tsx`: 136, `kpi-card-shell.tsx`: 119, `home-chart-utils.ts`: 107, `screen.tsx`: 98, `location-distribution-card.tsx`: 86, `types.ts`: 82, `quick-actions-bar.tsx`: 76, `attention-list-card.tsx`: 66 satır). `npm run type-check`, `npm run lint`, `npm test` (23 dosya, 149 test) ve `npm run build` sıfır hata ile geçti.

---

# Alışveriş Tablosu Hydration Hatası İncelemesi

- Sıralama butonu ile toplu seçim kutusu aynı tablo başlığında kardeş kontrollere ayrıldı; sıralama ve seçim erişilebilirlik bilgileri korundu.
- `npx vitest run tests/components/shopping/shopping-desktop-table.test.tsx` başarılı.
- `npm run type-check` ve `npm run build`, mevcut `part-equipment-dialog.tsx:110` ekipman oluşturma girdisindeki eksik zorunlu alanlar nedeniyle başarısız; bu hata ilgili değişikliğin dışında kalıyor.

---

# Alışveriş Tutarı Dönüşümü İncelemesi

- Alışveriş ekranları, fiş aktarımı, sıralama, özetler ve API fiyat/tutar terminolojisine taşındı. Eski kayıtlar ve eski API istemcileri uyumluluk alanlarıyla destekleniyor; fiyat temizleme eski değeri geri getirmiyor.
- Fişten aktarılan satır toplamı korunuyor, sıfır fiyat gösteriliyor ve envanter değeri alış fiyatı ile stok miktarından hesaplanıyor.
- Doğrulama: `npm run type-check`, `npm test` (33 dosya, 183 test), ilgili dosyalarda ESLint ve `npm run build` başarılı. Gerçek tarayıcı testi yapılmadı.
- Açık nokta: Mevcut çoklu para birimi toplamlarında kur dönüşümü uygulanmıyor; farklı para birimlerini içeren toplamlar ortak bir para birimine çevrilmiş sonuç olarak değerlendirilmemeli.
