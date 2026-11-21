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

## Doğrulama Sonuçları

- Tüm kaynak ve test dosyaları 250 satır sınırının altında (`analyzer.ts`: 166, `batch-request.ts`: 204, `deduplicate.ts`: 160, `json-repair.ts`: 171, `model-catalog.ts`: 182, `parser.ts`: 241, `prompt.ts`: 32, `receipt-deduplicate.test.ts`: 247 satır).
- `npm test` (19 test dosyası, 131 test) ve `npm run type-check` sıfır hata ile geçti.
