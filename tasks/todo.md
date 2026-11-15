# Umay – Uygulama Planı (`tasks/todo.md`)

## İnceleme Özeti

- **Faz 0–1 (Keşif & Dönüşüm):** Tulpar mimarisi `docs/TULPAR-NOTES.md` ve varsayımlar `docs/ASSUMPTIONS.md` içinde belgelendi. Proje `umay` adına taşındı, `public/umay-logo.svg` ve PWA ikonları üretildi, `firebase.json`, `firestore.rules`, `firestore.indexes.json` ve `storage.rules` oluşturuldu.
- **Faz 2 (Tasarım Sistemi):** Semantik yüzey token'ları eklendi; `StatusPill`, `Stat`, `QuantityStepper` ve `BottomNav` çekirdek bileşenleri geliştirildi; `/design` vitrini ve mobil alt gezinmeli `AuthShell` kuruldu.
- **Faz 3 (Auth & Veri Katmanı):** `.env` ve `.env.example` Firebase Google Auth + Firestore + Emulator yapılandırmasıyla hazırlandı; `signInWithGooglePopup` + `/api/auth/firebase` + `uid` kapsamlı `/api/inventory/*` uç noktaları ve atomik repository katmanı yazıldı.
- **Faz 4–8 (Özellikler):** Konumlar (`/locations`), Kategoriler (`/categories`), Ürünler (`/items`, `/items/[id]`, görsel sıkıştırma, QR etiket), Alışveriş Listesi (`/shopping`), Ömürlü Parçalar (`/parts`, `/parts/[id]`, 2 dokunuşla değişim ve yedek stok düşümü, `/api/jobs/refresh-parts`), Panel (`/home`), Barkod/QR Tarayıcı (`/scan`), Komut Paleti (`Ctrl/⌘+K`), Faaliyet & Bildirimler (`/activity`) ve Ayarlar/CSV-JSON Yedekleme (`/settings`) tamamlandı.
- **Faz 9 (PWA, Seed, Test & Belgeleme):** `public/sw.js`, IndexedDB çevrimdışı yazma kuyruğu (`offline-queue.ts`), `scripts/seed.ts`, repository/lifecycle/isolation testleri ve `README.md` tamamlandı.
