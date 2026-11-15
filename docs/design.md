# Umay — Tasarım Rehberi (design.md)

> **"Evin bereketi, kayıt altında."**
> Bu dosya Umay'ın görsel dilinin tek kaynağıdır. Kod yazan her ajan/geliştirici, UI işine başlamadan önce bunu okur. `AGENTS.md` ile çelişirse `AGENTS.md` kazanır; eksik kalan her konuda bu dosya geçerlidir.

---

## 1. Tasarım Özü

**Karakter: "Sakin ocak başı düzeni."** Sıcak, güvenilir, bilgi yoğun ama sakin. Bir ev aletinin kontrol paneli değil, iyi tutulmuş bir defter gibi.

**Dört ilke**

- **Önce bilgi, sonra süs.** Her ekranda ilk bakışta cevaplanması gereken soru: _"Neye ilgi göstermem gerekiyor?"_ Dekorasyon bu cevabı gölgelememeli.
- **Sıcak nötrler + tek vurgu.** Yüzeyler hafif sıcak tonlu (kül/taş), tek vurgu rengi "gök mavisi". Marka sıcaklığı yalnızca logoda ve boş durum illüstrasyonlarında "kor" rengiyle gelir.
- **Renk = durum.** Yeşil/sarı/kırmızı yalnızca durum bildirir; asla dekoratif kullanılmaz. Her durum **renk + ikon + metin** ile verilir.
- **Başparmakla kullanılabilir.** Mobil öncelikli: büyük hedefler, alt gezinme, alt sheet'ler, tek elle akışlar.

**Yapmayacaklarımız (Tulpar kuralı, bağlayıcı):** glow, neon, yapay gradient, cam efekti (glassmorphism), kontrolsüz animasyon, kart içinde süs ikonları, kategori renginde kart zemini, üst üste binen gölgeler.

**Tulpar'dan miras:** dark-first yaklaşım, 1px net çizgiler (brutalist iskelet), Radix tabanlı çekirdek bileşenler, token isimleri. **Umay'a özgü:** daha sıcak nötrler, daha yumuşak köşeler, açık temanın birinci sınıf desteği, sayısal okunabilirliğe odaklı tipografi.

---

## 2. Renk Sistemi

Tüm renkler **semantik CSS değişkenleri** olarak tanımlanır; bileşenlerde ham hex kullanılmaz. Tulpar'daki mevcut token'larla (`void-black`, `obsidian`, `gunmetal`, `titanium`, `ash`, `tulpar-blue`) karşılaştır: değerler yakınsa mevcut token'a **takma ad (alias)** ver, uzaksa aşağıdaki değerleri semantik katmanda tanımla. Token adlarını silme/yeniden adlandırma.

### 2.1 Çekirdek palet

| Token              | Açık tema | Koyu tema | Kullanım                                                            |
| ------------------ | --------- | --------- | ------------------------------------------------------------------- |
| `--bg`             | `#FAF8F5` | `#121110` | Sayfa zemini                                                        |
| `--surface`        | `#FFFFFF` | `#1A1816` | Kart, panel                                                         |
| `--surface-raised` | `#FFFFFF` | `#211F1C` | Sheet, dialog, popover                                              |
| `--surface-sunken` | `#F3F0EB` | `#0D0C0B` | Girdi zemini, tablo başlığı, iskelet                                |
| `--border`         | `#E5E0D8` | `#2E2B27` | Varsayılan 1px çizgi                                                |
| `--border-strong`  | `#CFC8BD` | `#433F39` | Hover/odak öncesi, ayırıcılar                                       |
| `--text`           | `#1C1A17` | `#F3EFE9` | Ana metin, değerler                                                 |
| `--text-muted`     | `#5F5A52` | `#B5AEA3` | Etiket, meta                                                        |
| `--text-subtle`    | `#8A847A` | `#8A8379` | Yalnızca placeholder/devre dışı; **gerekli bilgi için kullanılmaz** |
| `--accent` (gök)   | `#2B59C3` | `#7A9CFF` | Birincil eylem, aktif sekme, bağlantı, odak halkası                 |
| `--accent-hover`   | `#234AA3` | `#98B3FF` |                                                                     |
| `--accent-subtle`  | `#E8EEFB` | `#1B2540` | Seçili satır, bilgi zemini                                          |
| `--on-accent`      | `#FFFFFF` | `#0B1020` | Accent üzerindeki metin                                             |
| `--ember` (kor)    | `#D9622B` | `#F08A4B` | **Yalnızca** logo, boş durum illüstrasyonu, marka anları            |

> Tulpar'ın `tulpar-blue`'su accent'e takma ad olabilir; Umay'da accent bir **gök mavisi**dir (Gök Tanrı / Umay'ın gökle bağı çağrışımı). Ember (kor) asla buton, bağlantı veya durum rengi olmaz.

### 2.2 Durum renkleri (yalnızca durum)

| Durum     | Açık: metin / zemin   | Koyu: metin / zemin   | İkon                    | Anlam                                  |
| --------- | --------------------- | --------------------- | ----------------------- | -------------------------------------- |
| `success` | `#1F7A4D` / `#E3F3EA` | `#4CC38A` / `#12281E` | `CheckCircle2`          | Yeterli stok, parça `ok`, tamamlandı   |
| `warning` | `#A15C07` / `#FBF0DC` | `#E8A33D` / `#2C2210` | `Clock` / `AlertCircle` | `due_soon`, SKT yaklaşıyor, düşük stok |
| `danger`  | `#B3261E` / `#FBE5E3` | `#F2766E` / `#301615` | `AlertTriangle`         | `overdue`, tükendi, SKT geçti, hata    |
| `info`    | accent ile aynı       | accent ile aynı       | `Info`                  | Nötr bilgi                             |

**Durum eşlemesi (alan modeline):**

- Parça: `ok` → success · `due_soon` → warning · `overdue` → danger
- Stok: `quantity > minQuantity` → nötr (rozet yok) · `<= minQuantity` → warning "Düşük stok" · `0` → danger "Tükendi"
- SKT/garanti: >30 gün nötr · ≤30 gün warning · geçmiş danger
- **"Her şey yolunda" durumunda rozet gösterme.** Sessizlik = iyi. Dikkat çekici olan yalnızca istisnadır.

### 2.3 Kategori renkleri (küçük nokta/etiket için)

Kategori rengi **yalnızca 8–10px nokta veya küçük etiket**tir; kart zemini, kenarlık veya büyük alan boyamaz.

`--cat-1` terakota `#C4622D` · `--cat-2` zeytin `#7A8B2E` · `--cat-3` camgöbeği `#1E8A8A` · `--cat-4` gök `#3D7FD0` · `--cat-5` mor `#7A5BC4` · `--cat-6` gül `#C2487A` · `--cat-7` aklar `#B8892B` · `--cat-8` arduvaz `#5F7185`

Koyu temada aynı tonları %12–15 açık kullan. Varsayılan eşleme: Mutfak → cat-1, Elektronik → cat-4, Kablo & Aksesuar → cat-8, Temizlik → cat-3, Banyo → cat-5, Yedek Parça → cat-7.

### 2.4 Erişilebilirlik

- Metin kontrastı **WCAG AA** (normal metin ≥ 4.5:1, büyük metin ve bileşen kenarlığı ≥ 3:1). Yukarıdaki değerler bu hedefe göre seçildi; **yine de** `src/lib/design/contrast.test.ts` içinde token çiftlerini (metin/zemin, durum metni/durum zemini, accent/on-accent) iki temada hesaplayan bir birim test yaz ve eşiği altında kalanı düzelt.
- Durum asla yalnızca renkle verilmez; ikon + kısa metin zorunludur.
- Odak halkası: 2px `--accent`, 2px offset, iki temada da görünür.

---

## 3. Tipografi

### 3.1 Font aileleri

| Rol                        | Aile               | Ağırlıklar    | Neden                                                        |
| -------------------------- | ------------------ | ------------- | ------------------------------------------------------------ |
| **Başlık / metrik / logo** | **Manrope**        | 600, 700      | Geometrik ama sıcak, rakamları net; marka karakterini taşır  |
| **Gövde / arayüz**         | **Inter**          | 400, 500, 600 | Küçük boyutlarda en okunaklı UI fontu, tabular rakam desteği |
| **Kod / barkod / seri no** | **JetBrains Mono** | 400, 500      | Karıştırılan karakterler (0/O, 1/l) net ayrışır              |

Üçü de **Latin Extended** destekler; Türkçe karakterler (ç ğ ı İ ö ş ü) tam çalışır. Tulpar'da farklı bir font ailesi kullanılıyorsa Umay için yukarıdakilerle **değiştir**; Tulpar'ın fontunu miras alma.

### 3.2 Yükleme (Next.js)

`next/font/google` ile **self-host** (çevrimdışı PWA'da çalışması için dış istek yok):

```ts
// src/lib/fonts.ts
import { Inter, Manrope, JetBrains_Mono } from 'next/font/google';

export const fontBody = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

export const fontHeading = Manrope({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

export const fontMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
```

Kök `<html>` öğesine üç `variable` sınıfı eklenir; `lang` her zaman aktif dile eşitlenir (Tulpar'daki `LocaleHtmlSync` bunu yapıyor). Tailwind: `fontFamily.sans → var(--font-body)`, `fontFamily.heading → var(--font-heading)`, `fontFamily.mono → var(--font-mono)`. Fallback yığını: `system-ui, -apple-system, 'Segoe UI', sans-serif`.

### 3.3 Tip ölçeği (5 basamak + metrik)

| Stil      | Boyut / satır | Aile · ağırlık              | Kullanım                                             |
| --------- | ------------- | --------------------------- | ---------------------------------------------------- |
| `display` | 28 / 36       | Manrope 700, `-0.01em`      | Sayfa başlığı (mobilde 24/32)                        |
| `title`   | 20 / 28       | Manrope 600                 | Bölüm ve kart başlığı, sheet başlığı                 |
| `body`    | 16 / 24       | Inter 400                   | Okuma metni, form girdileri                          |
| `body-sm` | 14 / 20       | Inter 400/500               | **Varsayılan arayüz metni**, liste satırı            |
| `caption` | 12 / 16       | Inter 500, `--text-muted`   | Etiket, meta, zaman damgası                          |
| `metric`  | 28 / 32       | Manrope 700, `tabular-nums` | Kartın **birincil metriği** (stok sayısı, kalan gün) |

Kurallar:

- **Girdiler mobilde en az 16px** (iOS yakınlaştırma zıplamasını önler).
- **Tüm sayılar `font-variant-numeric: tabular-nums`**: miktar, tarih, fiyat, yüzde. Listelerde sütunlar hizalı kalır.
- **Etiket/değer ayrımı:** etiket `caption` + `--text-muted`, değer `body-sm` veya `metric` + `--text`. Etiket küçük ve soluk, değer büyük ve koyu.
- Başlıklar cümle düzeninde yazılır ("Ürün ekle"), **ALL CAPS yok**.
- Satır uzunluğu 60–72 karakteri geçmesin (`max-w-prose`).
- Italik yalnızca vurgulu alıntı/ipucu için; kalın en çok `600`.

### 3.4 Türkçe tipografi detayları

- **İ / ı:** CSS `text-transform: uppercase` kullanma (yanlış `I` üretebilir). Gerekiyorsa `toLocaleUpperCase('tr-TR')`. Mümkünse büyük harf stilinden tamamen kaçın.
- **Sayı biçimi:** `Intl.NumberFormat('tr-TR')` → `1.234,56`; para `1.234,56 ₺`. Birim ile miktar arasında ince boşluk: `2,5 kg`, `12 adet`.
- **Tarih:** kısa `15 Kas 2026`, uzun `15 Kasım 2026 Pazar`; saat 24 saatlik `14:30`. Göreli: "3 gün sonra", "2 gün gecikti". Tüm hesaplar `Europe/Istanbul`.
- **Uzun Türkçe sözcükler:** etiketler 2 satıra sarabilir; butonlarda sabit genişlik yerine `min-width` kullan, metni kırpma (`truncate`) yalnızca tek satırlık meta alanlarında.
- Ek/ünlü uyumu gerektiren birleşik cümleler yerine **sabit kalıplar** kullan ("Parça: Su filtresi" yerine "Su filtresi'ni" gibi çekimli yapıları üretmeye çalışma).

---

## 4. Yerleşim, Boşluk, Biçim

- **4px taban ızgara.** Boşluk ölçeği: 4, 8, 12, 16, 20, 24, 32, 48.
- **Kart:** iç boşluk 16 (mobil) / 20 (≥768px). Kartlar arası 12.
- **Sütunlar:** <768px tek sütun · ≥768px iki · ≥1200px üç. İçerik `max-w-6xl`, ortalı.
- **Gezinme:** mobil **alt çubuk** (Panel, Ürünler, Parçalar, Liste, Daha fazla) + **sabit "+ Ekle"** eylemi başparmak bölgesinde; masaüstü **sol kenar çubuğu** (daraltılabilir).
- **Köşe yarıçapı:** `sm 6` (rozet, girdi içi), `md 10` (buton, girdi, kart), `lg 14` (sheet, dialog). Köşeli/keskin `rounded-none` stil kullanılmaz; tüm etkileşimli ve kapsayıcı öğeler yumuşak radius taşır.
- **Üst çubuk hizası:** kenar çubuğu marka başlığı ile ana üst gezinme çubuğu aynı sabit yükseklikte (`h-16`) tutulur; yatay çizgiler tüm kırılımlarda kesintisiz birleşir.
- **Çizgi:** 1px `--border`. Ayrım için önce çizgi/boşluk, sonra zemin farkı; gölge son çare.
- **Gölge:** tek seviye, yalnızca yüzen katmanlarda (popover, sheet): açık tema `0 4px 16px rgb(28 26 23 / 0.08)`; koyu temada gölge yerine `--border-strong` kenarlık.
- **Yoğunluk:** liste satırı mobilde ≥ 56px, masaüstü tablo görünümünde 44px.
- **Safe area:** alt çubuk ve sheet'ler `env(safe-area-inset-bottom)` ekler (iOS PWA).

---

## 5. Hareket

- Yalnızca **durum geçişi** için: 150–200ms, `ease-out`; sheet açılışı en fazla 240ms.
- İzin verilen: opacity, kısa `translateY` (≤8px), ilerleme çubuğu genişlik geçişi, sayı değişiminde 120ms vurgu.
- Yasak: sürekli dönen/titreyen öğeler, sayfa yüklemede süslü giriş animasyonları, parallax, bounce.
- `prefers-reduced-motion: reduce` altında tüm geçişler anında olur.
- Framer Motion yalnızca sheet/dialog ve liste öğesi ekleme-çıkarma için.

---

## 6. İkonlar ve Görseller

- **Lucide**, çizgi kalınlığı `1.75`, boyutlar 16 / 20 / 24. İkon her zaman metinle eşleşir; yalnızca ikonlu buton `aria-label` taşır.
- **Önerilen eşleme:** Panel `LayoutDashboard` · Ürünler `Package` · Parçalar `Wrench` · Liste `ShoppingCart` · Konum `MapPin` · Barkod `ScanLine` · Fiş `Receipt` · Bildirim `Bell` · Düşük stok `PackageMinus` · SKT `CalendarClock` · Garanti `ShieldCheck` · Değiştir `RefreshCw`.
- **Kategori ikonu** kategori adının yanında 16px; renk her zaman `--text-muted` (kategori rengi yalnızca nokta).
- **Fotoğraflar:** 1:1 kırpılmış küçük önizleme (kart 56–72px), detayda 4:3; `rounded-md`; yüklenene kadar `--surface-sunken` iskelet.
- **Boş durum illüstrasyonu:** tek renkli çizgi illüstrasyon, ana çizgi `--text-muted`, tek vurgu `--ember`; en fazla 120px; altında 1 cümle + 1 eylem.

---

## 7. Logo ve Marka

- **Wordmark:** "Umay", Manrope 700, `-0.01em`, cümle düzeni (ilk harf büyük).
- **Simge:** geometrik, tek renkli bir **ev/kemer silueti içinde küçük bir alev** (ocak). Çizgi kalınlığı ikon ailesiyle uyumlu; gradient ve glow yok. Alev `--ember`, ev çerçevesi `--text`.
- **Kullanım:** SVG olarak `public/brand/` altında (wordmark, simge, birlikte). Favicon, PWA ikonları (192/512, **maskable**) ve `apple-touch-icon` simgeden üretilir; PWA `theme_color` açık temada `#FAF8F5`, koyu temada `#121110`.
- **Koruma alanı:** simge yüksekliğinin %50'si kadar boşluk. En küçük boyut 16px (favicon'da yalnızca alev).
- **Ton (metin):** sıcak, sade, "sen" dili. Örnek: "Su arıtma filtresi 3 gün içinde değişmeli." / "Zeytinyağı bitmek üzere, listeye ekleyelim mi?" / "Her şey yolunda." Ünlem ve emoji kullanma.

---

## 8. Bileşen Kuralları

Önce `src/components/core`'da mevcut bileşeni kullan; yoksa ekle. Her bileşen şu durumları sunar: `default · hover · focus-visible · active · disabled · loading · error`.

**Button** — `primary` (accent dolgu, `--on-accent`), `secondary` (kenarlıklı), `ghost` (zeminsiz), `danger` (yalnızca yıkıcı eylem, onaylı). Yükseklik 44 (varsayılan), 36 (sıkı masaüstü). Bir görünümde **tek** primary buton.

**Input / Select / Textarea** — zemin `--surface-sunken`, 1px `--border`, odakta accent kenarlık + halka; hata durumunda `danger` kenarlık + altında hata metni (ikon + metin). Etiket her zaman girdinin üstünde (placeholder etiket yerine geçmez).

**StatusPill** — küçük, `rounded-sm`, `caption` boyutu; yapı: `[ikon 14px] Metin`; zemin durum-subtle, metin/ikon durum rengi.

**ProgressBar (parça ömrü)** — 8px yükseklik, `rounded-full`, iz `--surface-sunken`; dolgu **kalan ömrü** gösterir. Renk: kalan > %20 nötr (`--accent`), ≤ %20 veya `reminderLeadDays` içinde `warning`, 0 / geçmiş `danger`. Yanında kalan gün ve % **metin olarak** (örn. "42 gün · %35"). Çubuk tek başına anlam taşımaz.

**QuantityStepper** — `−` / değer / `+`; hedefler ≥44px; değer `metric` boyutunda tabular; uzun basışta hızlı artış; her değişiklik StockMovement oluşturur, 5 sn "Geri al" toast'ı.

**Card** — aşağıdaki hiyerarşi zorunlu:

1. **Başlık satırı:** ad (`title`/`body-sm` 600) + sağda durum rozeti (yalnızca istisnada)
2. **Birincil metrik (en belirgin öğe):** stok miktarı **veya** parça ömür çubuğu — `metric` boyutu
3. **İkincil meta (tek satır, soluk):** konum · kategori noktası + ad · son hareket
4. **Eylem satırı (en fazla 2):** biri `primary`/`secondary`, diğeri `ghost`
   Kartta 4'ten fazla bilgi grubu bulunmaz; fazlası detay sayfasına gider. Kart zemini daima `--surface`; tüm kart tıklanabilirse hover'da `--border-strong`.

**Sheet / Dialog** — mobilde **alt sheet** (tutma çubuğu, sürükleyerek kapat), masaüstünde ortalı dialog. Yıkıcı onaylarda birincil buton `danger`, varsayılan odak "Vazgeç"te.

**Toast** — alt çubuğun üstünde, en fazla 1 görünür; başarı kısa (3 sn), geri alınabilir işlem 5 sn; hata kullanıcı kapatana kadar.

**EmptyState / Skeleton / ErrorState** — her liste ve kart için üçü de tanımlı. İskelet `--surface-sunken`, atım animasyonu yok (veya çok yavaş opacity).

**Tablo (masaüstü ürün listesi)** — başlık `caption`, satır 44px, sayısal sütunlar sağa hizalı ve tabular, sticky başlık, seçili satır `--accent-subtle`.

**BottomNav** — 5 öğe, aktif öğe accent ikon + metin, pasif `--text-muted`; öğe başına ≥56px genişlik, ≥56px yükseklik.

---

## 9. Ekran Bazlı Notlar

- **Panel (`/home`):** üstte 4 özet kartı (Toplam ürün · Düşük stok · Yaklaşan parça değişimi · SKT/garanti). Altında "Bugün ilgilenmen gerekenler": gecikmiş parçalar → düşük stok → SKT sırasıyla tek liste, her satırda durum rozeti ve tek hızlı eylem. Her şey yolundaysa sıcak bir boş durum: "Bugün için bir şey yok." Dağılım grafiği sade yatay çubuk (tek renk + etiket), pasta grafik yok.
- **Ürünler (`/items`):** arama çubuğu üstte sabit, filtreler yatay kaydırılan chip'ler; kart/tablo geçişi. Düşük stok ve SKT filtreleri tek dokunuş.
- **Ürün detayı:** üstte ad + birincil metrik (miktar) + hızlı stepper; sekmeler: Bilgi · Hareketler · Parçalar · Belgeler. QR etiketi sayfa menüsünde.
- **Parçalar (`/parts`):** öncelik sırası `overdue → due_soon → ok`; her kartta ömür çubuğu birincil öğe; "Değiştirildi" birincil eylem.
- **"Değiştirildi" akışı:** alt sheet, 2 adım: (1) tarih (bugün varsayılan) + maliyet + not, (2) yedek stok bilgisi: _stokta varsa_ "Yedek stoktan 1 adet düşülecek", _yoksa_ uyarı + "Alışveriş listesine ekle" önerisi. Onay sonrası toast + geri al.
- **Alışveriş (`/shopping`):** kaynak etiketi küçük (Düşük stok · Parça · Manuel); büyük onay kutusu (≥44px); "Alındı" işaretlenince "Stoğa ekleyelim mi?" önerisi.
- **Barkod tarama (`/scan`):** tam ekran kamera, ortada kare çerçeve (2px `--accent`), altta eylem sheet'i; izin reddedilirse manuel giriş alanı.
- **Fiş analizi (AI):** 3 adım — (1) görsel yükle/çek, (2) **doğrulama ekranı**: mağaza/tarih/tutar ve kalem tablosu tamamen düzenlenebilir; modelin düşük güvenli olduğu alanlar `warning` zeminli "Kontrol et" etiketiyle, (3) onay: kalemleri stok girişi/alışveriş geçmişi olarak kaydet. Model çıktısına asla otomatik güvenme; kaydetmeden önce kullanıcı onayı şart. Yükleme sırasında sade ilerleme metni ("Fiş okunuyor…"), uzun sürerse iptal seçeneği; tüm modeller başarısız olursa net hata + manuel giriş.
- **Bildirimler/Faaliyet (`/activity`):** iki sekme (Bildirimler · Hareketler); okunmamışlar solda ince accent çizgi; ertele/okundu eylemleri kaydırma + buton (erişilebilirlik için buton şart).
- **Ayarlar:** gruplanmış liste (Görünüm, Hatırlatma, Para birimi ve tarih, Yedekleme); tema seçici üçlü: Açık · Koyu · Sistem.

---

## 10. Çevrimdışı ve Durum Geri Bildirimi

- Çevrimdışıyken üstte ince, kalıcı olmayan bir şerit: "Çevrimdışısın — değişiklikler kuyruğa alınıyor." (`info`, ikon `WifiOff`).
- Kuyruktaki işlemler listede küçük "Bekliyor" etiketiyle (`Clock` ikonu); eşitlenince etiket kalkar. Eşitleme hatasında `danger` etiketi + "Tekrar dene".
- Yükleme durumları: >300ms sürerse iskelet göster, <300ms'de gösterme (titreme önler).

---

## 11. Uygulama Notları (Tailwind / Next.js)

- Renkler `src/app/globals.css` içinde `:root` (açık) ve `.dark` altında **RGB üçlüsü** değişkenleri olarak tanımlanır (`--accent: 43 89 195;`), Tailwind `colors` bunları `rgb(var(--accent) / <alpha-value>)` ile okur. Böylece `bg-accent/10` gibi opaklıklar çalışır.
- Tailwind `theme.extend`: `colors` (semantik + `cat-*` + Tulpar takma adları), `fontFamily`, `fontSize` (yukarıdaki ölçek, satır yüksekliğiyle), `borderRadius` (`sm 6 / md 10 / lg 14`), `boxShadow.float`.
- Koyu tema `next-themes` ile `class` stratejisi; varsayılan **sistem**, kullanıcı seçimi saklanır.
- Geliştirme ortamına özel `/design` sayfası: renk token'ları (iki tema yan yana), tip ölçeği, tüm bileşenler ve tüm durumları, örnek stok kartı + parça kartı + boş/iskelet/hata durumları. Görsel inceleme bu sayfadan yapılır.
- Dosya başına 250 satır kuralı token dosyaları için de geçerli: `tokens/colors.ts`, `tokens/typography.ts`, `tokens/spacing.ts` olarak böl.

---

## 12. Gözden Geçirme Listesi (her UI değişikliğinde)

- [ ] Yalnızca semantik token kullanıldı, ham hex yok
- [ ] Durum bilgisi renk + ikon + metinle verildi; "iyi" durumda rozet yok
- [ ] Kartta birincil metrik tek ve belirgin; ≤4 bilgi grubu; ≤2 eylem
- [ ] Sayılar `tabular-nums`; Türkçe biçimler (`tr-TR`) ve `Europe/Istanbul` uygulandı
- [ ] Mobilde 375px'te tek elle kullanılabilir; hedefler ≥44px; girdiler ≥16px
- [ ] Açık ve koyu temada ikisi de kontrol edildi; kontrast testi geçiyor
- [ ] Glow, gradient, gereksiz animasyon ve dekoratif renk yok
- [ ] Boş, yükleniyor ve hata durumları tasarlandı
- [ ] `prefers-reduced-motion` ve klavye odağı çalışıyor
- [ ] Hiçbir dosya 250 satırı aşmıyor; ham HTML primitive kullanılmadı
