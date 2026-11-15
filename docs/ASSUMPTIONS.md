# Umay – Varsayımlar ve Mimari Kararlar (`ASSUMPTIONS.md`)

Bu belge, geliştirme sürecinde sorulmadan alınan makul teknik ve ürün kararlarını kaydeder.

1. **Depo Başlangıcı:** Çalışma dizini (`/Users/zafergok/Documents/github/ZAFER/WEB/umay`) halihazırda Tulpar şablonundan türetilmiş `umay` Git deposu olarak başlatılmış durumdaydı. `.git` klasörü korunarak Faz 1 dönüşüm commit'i ile devam edildi.
2. **`(admin)` Kabuğu ve Rotaları:** Umay tek kullanıcılı (ileride aile/çok kullanıcılı genişletilebilir) bir ev envanteri uygulaması olduğu için ayrı bir `/admin` paneli yerine veri içe/dışa aktarma, yedekleme ve uygulama tercihleri `(auth)` altındaki `/settings` ve `/activity` ekranlarına taşındı. `/admin` rotaları sadeleştirilip `/settings` üzerine yönlendirilebilir veya yalnızca teknik yönetim için minimal bırakıldı (kullanıcı karmaşası yaratmamak adına ana gezinme `(auth)` içinde tutuldu).
3. **Veri Katmanı ve Yerel Geliştirme (Firestore + In-Memory/Emulator Fallback):**
   - Sunucu tarafında tüm veriler `firebase-admin` üzerinden Firestore'a (`users/{uid}/...`) yazılır.
   - `FIREBASE_PROJECT_ID` / `FIRESTORE_EMULATOR_HOST` tanımlı olmadığında veya CI/test ortamında uygulamanın kesintisiz çalışabilmesi ve test edilebilmesi için, yalnızca geliştirme/test amaçlı açıkça işaretlenmiş bir bellek/dosya tabanlı geliştirme deposu adaptörü yerine **Firebase Emulator Suite** (`firebase.json`, `firestore.indexes.json`, `firestore.rules`) yapılandırması sağlandı.
   - Birim/entegrasyon testlerinde Firestore transaction ve kullanıcı izolasyonu mantığı hem saf domain/repository testleriyle hem de Emulator uyumlu yapıyla doğrulanır.
4. **Kimlik Doğrulama (Firebase Auth + Tulpar Session Cookie):**
   - Giriş/Kayıt akışı Firebase Auth REST API (`identitytoolkit.googleapis.com` veya Firebase Auth Emulator) ile e-posta/şifre doğrulaması yapar; başarılı doğrulama sonrası sunucu tarafında Tulpar `session.ts` ile `httpOnly` oturum çerezi (`session`) ve istemci `useAuthStore` için JWT üretilir.
   - Emulator veya Firebase API anahtarı olmayan yerel hızlı deneme senaryoları için `.env` üzerinden `ALLOW_DEMO_AUTH=true` bayrağıyla demo kullanıcı girişi desteklenir (varsayılan üretimde kapalıdır).
5. **Logo ve PWA İkonları:**
   - `public/umay-logo.svg` basit, tek renkli geometrik ocak/alev + ev işareti olarak SVG formatında oluşturuldu; favicon ve PWA ikonları (`192x192`, `512x512`, `apple-touch-icon`) bu SVG temel alınarak üretildi.
6. **Grafikler ve Barkod/QR:**
   - Dağılım grafikleri ek bağımlılık olmadan sade SVG/CSS çubuk grafik olarak uygulandı (`recharts` kullanılmadı).
   - Barkod tarama için tarayıcıda `BarcodeDetector` API varsa doğrudan kullanılır, desteklenmeyen tarayıcılarda `@zxing/browser` fallback olarak devreye girer; QR etiket üretimi için hafif `qrcode` paketi kullanılır.
7. **Çevrimdışı / PWA Desteği:**
   - `public/sw.js` service worker dosyası statik varlıkları ve `/api/*` GET yanıtlarını ağ-öncelikli (network-first) önbellekler.
   - Çevrimdışıyken yapılan yazma işlemleri (`POST`/`PATCH`/`DELETE`) IndexedDB tabanlı bir çevrimdışı işlem kuyruğuna (`offline-queue`) alınır ve `online` olayı tetiklendiğinde sırayla sunucuya gönderilir.
8. **Saat Dilimi ve Yerelleştirme:**
   - Tüm ömür, SKT ve bildirim tarihi hesaplamaları `Europe/Istanbul` saat dilimi referans alınarak saf `src/lib/lifecycle` fonksiyonlarıyla yapılır.
   - Varsayılan dil `tr`, ikincil dil `en` olarak yapılandırılmıştır.
