# Umay — Ev Envanter & Stok Takip Uygulaması

> **"Evin bereketi, kayıt altında."** / *"Your home's abundance, accounted for."*

Umay; mutfak erzakları, elektronik eşyalar, kablolar/aksesuarlar ve kısa ömürlü değiştirilebilir parçalar (su arıtma filtresi, pil, diş fırçası başlığı, yazıcı kartuşu vb.) için geliştirilmiş mobil öncelikli bir **PWA** envanter ve stok defteri uygulamasıdır.

---

## Teknoloji Yığını

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript (Strict)
- **Stil & UI:** Tailwind CSS, Radix UI özel çekirdek bileşenler (`src/components/core`), açık/koyu tema (`next-themes`)
- **Durum & Veri:** Zustand (`umay-auth-storage`), TanStack React Query v5, React Hook Form + Zod
- **Backend & Veritabanı:** Next.js Route Handlers (`/api/*`) + `firebase-admin` (Firestore & Storage, `users/{uid}/...` izolasyonu)
- **Kimlik Doğrulama:** Firebase Authentication (Google ile Giriş + E-posta/Şifre) + sunucu tarafı JWT `httpOnly` oturum çerezi
- **Barkod/QR & PWA:** `BarcodeDetector` + `@zxing/browser` fallback, `qrcode` etiket üretimi, Service Worker (`public/sw.js`) + IndexedDB çevrimdışı kuyruk

---

## 10 Dakikada Kurulum

### 1. Bağımlılıkları Yükle
```bash
npm install
```

### 2. Ortam Değişkenlerini (`.env`) Hazırla
`.env.example` dosyasını `.env` olarak kopyala (veya mevcut `.env` dosyasını düzenle):
```bash
cp .env.example .env
```

**Canlı Firebase Projesi (Google Auth + Firestore + Storage) için:**
- Firebase Console → Project Settings → Your Apps (Web) altındaki `NEXT_PUBLIC_FIREBASE_*` değerlerini `.env` içine yaz.
- Firebase Console → Authentication → Sign-in method altından **Google** ve **Email/Password** sağlayıcılarını etkinleştir.
- Firebase Console → Project Settings → Service Accounts üzerinden aldığın `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` değerlerini `.env` içine ekle ve `*_EMULATOR_HOST` satırlarını yorum satırına al.

**Yerel Geliştirme (Firebase Emulator Suite) için:**
```bash
firebase emulators:start
```
Başka bir terminalde örnek Türkçe verileri Emulator'a yükle:
```bash
npx tsx scripts/seed.ts
```

### 3. Geliştirme Sunucusunu Başlat
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde açılır. Tasarım sistemini incelemek için `/design` rotasını ziyaret edebilirsin.

---

## Doğrulama Komutları

```bash
npm run lint
npm run type-check
npm run test
npm run build
npm run metadata:check
```

---

## Mimari Notlar

- Tüm veri erişimi `UI → hooks (React Query) → services → apiClient → /api/* → firebase-admin` akışını izler.
- Her `/api/inventory/*` uç noktası oturumdan gelen `uid` ile kapsamlanır (`users/{uid}/...`); istemciden gelen `uid` asla güvenilmez.
- Ömür ve saat dilimi hesapları (`src/lib/lifecycle`) `Europe/Istanbul` saat diliminde çalışır.
- Tulpar şablonu üzerine inşa edilmiştir (bkz. `docs/TULPAR-NOTES.md` ve `docs/ASSUMPTIONS.md`).
