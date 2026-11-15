# Umay – Uygulama Planı (`tasks/todo.md`)

## Faz 26 – `/settings` Ekranı Hizalama Düzeltmesi ve Kapsamlı Uygulama Ayarları (İnceleme Özeti)

### Yapılan Değişiklikler
- **Ayar Modeli ve Kısmi Güncelleme (`UserSettings`):** [lifecycle.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/types/lifecycle.ts), [lifecycle-schemas.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/schemas/lifecycle-schemas.ts), [memory-store.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/memory-store.ts) ve [shopping-settings-repo.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/shopping-settings-repo.ts) içine `defaultUnit` ve `compactMode` alanları geriye dönük uyumlu varsayılanlarla eklendi; `updateUserSettings` kısmi birleştirme (`merge`) yapacak şekilde güncellendi.
- **Kabuk Genişliği ve Modüler `/settings` Ekranı (`src/features/routes/auth/settings/`):** [screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/settings/screen.tsx) üzerindeki `max-w-3xl` daralması kaldırılarak kabuğun tam genişliği ve `xl:grid-cols-12` düzenine geçildi; [settings-overview-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/settings/components/settings-overview-card.tsx), [theme-selector-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/settings/components/theme-selector-card.tsx) (tema + dil + `DensityToggle`), [inventory-rules-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/settings/components/inventory-rules-card.tsx) (para birimi, tarih formatı, varsayılan birim), [quick-tools-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/settings/components/quick-tools-card.tsx) ve [account-actions-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/settings/components/account-actions-card.tsx) TR/EN sözlükleriyle güncellendi. Yedekleme, dışa aktarma, hatırlatıcı ve çevrimdışı eşitleme arayüzleri `/profile` ve `/settings` ekranlarından tamamen kaldırıldı.

### Doğrulama Sonuçları
- `npm run lint`, `npm run type-check`, `npm run metadata:check` ve `npm run build` (36/36 rota) hatasız tamamlandı.
- `npm test`: 15 test dosyası, 111 test geçti ([repository.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/inventory/repository.test.ts) ve [i18n-dictionaries.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/i18n/i18n-dictionaries.test.ts) dahil).
- Açık kalan nokta: Tarayıcıda canlı görsel ekran görüntüsü doğrulaması yapılmadı; düzen, tip, lint, birim testleri ve production build doğrulandı.

---

## Faz 25 – `/profile` Ekranı Hizalama Düzeltmesi ve Kapsamlı Profil Yönetimi (İnceleme Özeti)

### Yapılan Değişiklikler
- **Kabuk Başlığı ve Rota Eşleşmesi:** [types.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/_shared/layouts/types.ts), [tr.json](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/_shared/layouts/i18n/tr.json), [en.json](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/_shared/layouts/i18n/en.json) ve [AppShellLayout.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/layout/AppShellLayout.tsx) içine `accountNavItems` (`/profile`, `/settings`, `/workspace`) eklenerek `/profile` rotasında üst bar ve `PageHeader` başlıklarının ("Panel" yerine "Profil ve Hesap") doğru görünmesi sağlandı.
- **Oturum Meta Verisi ve Şifre Sıfırlama:** [request-user.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/auth/request-user.ts) JWT içinden `sessionIssuedAt` / `sessionExpiresAt` zamanlarını çözecek şekilde genişletildi; [client.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/firebase/client.ts) içine `requestFirebasePasswordReset` eklendi.
- **Profil Ekranı Hizalaması ve Modüler Kartlar (`src/features/routes/auth/profile/`):** [screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/profile/screen.tsx) üzerindeki `max-w-4xl` daralması kaldırılarak kabuğun tam genişliği ve `xl:grid-cols-12` dengeli 2 sütun düzenine geçildi; [profile-overview-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/profile/components/profile-overview-card.tsx), [profile-preferences-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/profile/components/profile-preferences-card.tsx), [profile-session-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/profile/components/profile-session-card.tsx), [profile-recent-activity-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/profile/components/profile-recent-activity-card.tsx) ve [profile-danger-zone-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/profile/components/profile-danger-zone-card.tsx) ile sade ve odaklı hale getirildi.

### Doğrulama Sonuçları
- Tüm değiştirilen/eklenen dosyalar `<= 250` satır sınırının altında (`<= 232` satır).
- `npm run build`, `npm run type-check`, `npm run lint`, `npm run metadata:check` hatasız tamamlandı.
- `npm test`: 16 test dosyası, 113 test geçti ([export-route.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/auth/export-route.test.ts) ve [i18n-dictionaries.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/i18n/i18n-dictionaries.test.ts) dahil).
- Açık kalan nokta: Tarayıcıda canlı görsel ekran görüntüsü doğrulaması yapılmadı; tüm yerleşim, tip, lint, build ve API/i18n testleri doğrulandı.

---

## Faz 24 – Ürün Kartı (`ItemCard`) UX Analizi ve Modüler Refactor (İnceleme Özeti)

### Yapılan Değişiklikler
- **Modüler `ItemCard` (`src/features/routes/auth/items/item-card/`)**:
  - [item-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-card/item-card.tsx) (188 satır): `CategoryIcon` + senkronize kategori rengi rozeti, tıklanabilir ürün başlığı (Detay modalını açar), kategori/marka alt başlığı, durum/ürün tipi rozeti, konum (`MapPin`) ve SKT (`CalendarClock`) satırı, özel alan değer rozetleri (`anahtar: değer`) veya not özeti, ve `border-t` ile ayrılmış `Detay`, `Düzenle`, modal `Sil` aksiyon alt çubuğu eklendi.
  - [item-stock-panel.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-card/item-stock-panel.tsx) (93 satır): Sayısal stok göstergesi, eşik/hedef etiketi, anlamsal renkli (`bg-danger` / `bg-warning` / `bg-success`) stok seviyesi ilerleme çubuğu ve stok `0` olduğunda bile tek tıkla artırma yapabilen iki yönlü `-1` / `+1` segmente kontrol eklendi.
  - [item-card-utils.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-card/item-card-utils.ts) (91 satır) ve [index.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-card/index.ts) (1 satır) oluşturuldu; eski tek dosya `item-card.tsx` kaldırıldı.
- **Ekran & Tablo Güncellemeleri**:
  - [use-items-screen.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/items-screen/use-items-screen.ts) (184 satır), [items-screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/items-screen/items-screen.tsx) (194 satır) ve [items-filter-toolbar.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/items-screen/items-filter-toolbar.tsx) (133 satır) içinde `handleAdjustStock(+1 | -1)`, ürün bazlı `pendingItemId` yükleme durumu ve `DeleteConfirmationDialog` entegrasyonu sağlandı.
  - [items-table.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/items-table.tsx) (128 satır): Tablo görünümüne de `-1`, `+1`, `Detay`, `Düzenle` ve modal `Sil` butonları eklendi.

### Doğrulama Sonuçları
- Değiştirilen ve eklenen tüm dosyalar `<= 250` satır sınırının altında (`<= 194` satır).
- `npm run lint`: 0 hata.
- `npm test`: 15 test dosyası, 110 test geçti.
- `npm run metadata:check`: `All app routes expose metadata.`
- `npm run build` & `npm run type-check`: Hatasız tamamlandı.
- Açık kalan nokta: Tarayıcı üzerinden görsel UI etkileşim testi yapılmadı; mantık, tip, lint, birim testleri ve production build kontrolleri doğrulandı.

---

## Faz 23 – Ürün Detay ve Düzenle Akışlarının Modal Olarak Sunulması (İnceleme Özeti)

### Yapılan Değişiklikler
- **Ürün Detay Sayfasının Kaldırılması**: `src/app/(auth)/items/[id]/page.tsx` rotası ve `src/features/routes/auth/items/item-detail-screen/` klasörü kaldırıldı.
- **Modüler Ürün Detay Modalı (`item-detail-dialog/`)**: [index.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-dialog/index.ts), [item-detail-dialog.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-dialog/item-detail-dialog.tsx), [item-detail-body.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-dialog/item-detail-body.tsx), [use-item-detail-dialog.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-dialog/use-item-detail-dialog.ts), [item-detail-overview.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-dialog/item-detail-overview.tsx) ve [item-movements-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-dialog/item-movements-card.tsx) ile stok artırma/azaltma (`QuantityStepper`), kategori renk/ikon senkronizasyonu, teknik/özel alanlar, stok hareket geçmişi sekmesi, QR etiket, `ItemFormDialog` düzenleme geçişi ve `DeleteConfirmationDialog` silme akışı modal içine taşındı.
- **Ürünler Ekranı, Kart ve Tablo (`items/`)**: [items-screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/items-screen/items-screen.tsx), [use-items-screen.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/items-screen/use-items-screen.ts), [item-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-card.tsx) ve [items-table.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/items-table.tsx) üzerinde hem kart hem tablo görünümünden tek tıkla Detay ve Düzenle modallarının açılması sağlandı; `?new=1` ve `?item=<id>` URL parametreleri desteklendi.
- **Diğer Ekran Yönlendirmeleri**: [home/screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/home/screen.tsx) ve [command-palette.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/layout/command-palette.tsx) `/items?item=<id>` yönlendirmesine geçirildi; [scan/screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/scan/screen/screen.tsx) ve [use-scan-camera.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/scan/screen/use-scan-camera.ts) modülerleştirilerek barkod eşleşmesinde doğrudan Detay ve Düzenle modalları açılacak şekilde güncellendi.

### Doğrulama Sonuçları
- Değiştirilen ve eklenen tüm dosyalar `<= 250` satır sınırının altında (`item-detail-body.tsx` 229 satır, `items-screen.tsx` 224 satır).
- `npm run lint`: 0 hata.
- `npm test`: 15 test dosyası, 110 test geçti.
- `npm run metadata:check`: `All app routes expose metadata.`
- `npm run build` & `npm run type-check`: Hatasız tamamlandı (`/items/[id]` rotası route tablosundan kaldırıldı).
- Açık kalan nokta: Tarayıcıda canlı görsel UI etkileşim testi yapılmadı; mantık, tip, lint, birim testleri ve production build doğrulandı.

---

## Faz 22 – Tüm Silme İşlemlerinin Modal Üzerinden Yönetilmesi (İnceleme Özeti)

### Yapılan Değişiklikler
- **Paylaşılan Silme Onay Modalı (`DeleteConfirmationDialog`)**: [delete-confirmation-dialog.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/shared/delete-confirmation-dialog/delete-confirmation-dialog.tsx) içinde başarılı silme sonrasında `phase` durumu `'idle'` olarak sıfırlandı; aynı liste ekranında art arda birden fazla silme modalı açıldığında animasyon aşamasında takılma riski giderildi.
- **Ürün & Parça Detay Silme Akışları**:
  - [item-detail-screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-screen/item-detail-screen.tsx) ve [item-movements-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-screen/item-movements-card.tsx) klasör yapısına ayrıştırılıp ürün silme işlemi stok/konum/kategori detayları ve hareket geçmişi uyarısıyla `DeleteConfirmationDialog` üzerinden yönetildi.
  - [part-detail-screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/parts/part-detail-screen/part-detail-screen.tsx) ve [part-logs-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/parts/part-detail-screen/part-logs-card.tsx) klasör yapısına ayrıştırılıp parça silme işlemi kalan ömür ve değişim geçmişi detaylarıyla `DeleteConfirmationDialog` üzerinden yönetildi.
- **Konum & Kategori Silme Akışları**:
  - [locations/screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/locations/screen.tsx): Konum silme aksiyonu bağlı ürün sayısı, konum yolu ve varsa alt konum/bağlı ürün uyarılarıyla `DeleteConfirmationDialog` modalına bağlandı.
  - [categories/screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/screen.tsx) ve [category-custom-fields-tab.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/category-custom-fields-tab.tsx): Kategori silme (bağlı ürün/özel alan detayları ile) ve kategori içindeki özel alan silme aksiyonları `DeleteConfirmationDialog` üzerinden onaylı hale getirildi.
- **Alışveriş Listesi & Fotoğraf Silme Akışları**:
  - [use-shopping-delete.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/use-shopping-delete.ts), [shopping-delete-dialogs.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-delete-dialogs.tsx), [use-shopping-screen.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/use-shopping-screen.ts) ve [shopping/screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/screen.tsx): Tekil kalem silme ve "Alınanları Temizle" toplu silme işlemleri `DeleteConfirmationDialog` modalına taşındı.
  - [item-purchase-tab.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-form-dialog/item-purchase-tab.tsx): Ürün formundaki fotoğraf kaldırma aksiyonu `DeleteConfirmationDialog` onayına bağlandı.
  - Hesap silme işlemi mevcut [delete-account-dialog.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/shared/account-actions/delete-account-dialog.tsx) modalı ile korunuyor.

### Doğrulama Sonuçları
- Değiştirilen ve eklenen tüm dosyalar `<= 250` satır sınırının altında (`locations/screen.tsx` 246 satır; diğer tüm dosyalar `<= 220` satır).
- `npm run lint`: 0 hata.
- `npm test`: 15 test dosyası, 109 test geçti.
- `npm run metadata:check`: `All app routes expose metadata.`
- `npm run type-check`: 0 hata.
- `npm run build`: Next.js 16.4.6 Turbopack production build başarılı (36/36 statik sayfa).
- Açık kalan nokta: Tarayıcı üzerinden görsel UI etkileşim testi yapılmadı; tip, lint, birim testleri ve production build kontrolleri çalıştırılıp doğrulandı.

---

## Faz 21 – Gelişmiş Kategori Oluşturma ve Ürün/Alan Input Sistemi (İnceleme Özeti)

### Yapılan Değişiklikler
- **Veri Modeli, Şema ve Kalıcılık**: [inventory.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/types/inventory.ts), [inventory-schemas.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/schemas/inventory-schemas.ts), [location-category-repo.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/location-category-repo.ts), [item-stock-repo.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/item-stock-repo.ts) ve [utils.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/utils.ts) güncellendi; 7 alan tipi (`text`, `textarea`, `number`, `date`, `select`, `boolean`, `url`), gelişmiş alan kuralları (`unit`, `options`, `required`, `placeholder`, `helpText`, `defaultValue`, `min`, `max`, `showInSummary`), `Category.description`, `Category.itemDefaults` ve Firestore uyumlu `omitUndefinedDeep` temizliği eklendi.
- **Alan Sabitleri, Yardımcılar & Paylaşılan Inputlar**: [category-constants.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/constants/category-constants.ts), [category-presets.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/constants/category-presets.ts), [custom-field-utils.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/utils/custom-field-utils.ts), [category-icon.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/components/category-icon.tsx), [custom-field-boolean.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/components/custom-field-boolean.tsx) ve [custom-field-input.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/components/custom-field-input.tsx) ile Türkçe karakter duyarlı anahtar üretimi, doğrulama, biçimlendirme ve tüm alan tipleri için gelişmiş input bileşeni kuruldu.
- **Gelişmiş Kategori Ekranı & Modalı (`categories/`)**: [screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/screen.tsx), [category-form-dialog.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/category-form-dialog.tsx), [category-appearance-panel.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/category-appearance-panel.tsx), [category-item-defaults-panel.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/category-item-defaults-panel.tsx), [category-custom-fields-tab.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/category-custom-fields-tab.tsx), [custom-field-draft-form.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/custom-field-draft-form.tsx), [custom-field-type-options.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/custom-field-type-options.tsx), [select-options-editor.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/select-options-editor.tsx), [category-live-preview.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/category-live-preview.tsx) ve [category-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/categories/components/category-card.tsx) ile 4 sekmeli kategori oluşturma/düzenleme/çoğaltma akışı, hazır şablonlar, renk & ikon paleti, alan sıralama/düzenleme ve canlı önizleme eklendi.
- **Ürün Formu & Detay Entegrasyonu (`items/`)**: [select-field.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/forms/select-field.tsx), [item-form-dialog.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-form-dialog/item-form-dialog.tsx), [use-item-form-dialog.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-form-dialog/use-item-form-dialog.ts), [item-basic-tab.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-form-dialog/item-basic-tab.tsx), [item-technical-tab.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-form-dialog/item-technical-tab.tsx), [item-purchase-tab.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-form-dialog/item-purchase-tab.tsx), [tags-input.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-form-dialog/tags-input.tsx), [item-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-card.tsx), [item-specs-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-specs-card.tsx) ve [item-detail-screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/items/item-detail-screen.tsx) ile kategori değişiminde varsayılanların canlı uygulanması, tüm ürün ve özel alan inputları ve özet/detay görünümleri sağlandı.
- **Testler**: [categories.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/inventory/categories.test.ts) eklendi.

### Doğrulama Sonuçları
- Değiştirilen ve eklenen tüm dosyalar `<= 250` satır sınırının altında (`category-presets.ts` 245 satır).
- `npm run lint`: 0 hata, 0 uyarı.
- `npm test`: 15 test dosyası, 109 test geçti.
- `npm run metadata:check`: `All app routes expose metadata.`
- `npm run type-check`: 0 hata.
- `npm run build`: Next.js 16.4.6 Turbopack production build başarılı (36/36 statik sayfa).
- Açık kalan nokta: Tarayıcı üzerinden görsel UI etkileşim testi yapılmadı; mantık, şema, repository, tip ve derleme kontrolleri otomatik olarak doğrulandı.

---

## Faz 20 – Detaylı ve Profesyonel Alışveriş Listesi Tasarımı (İnceleme Özeti)

### Yapılan Değişiklikler
- **Veri Modeli, Şema & Kalıcılık**: [lifecycle.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/types/lifecycle.ts), [lifecycle-schemas.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/inventory/schemas/lifecycle-schemas.ts), [shopping-settings-repo.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/lib/inventory/repo/shopping-settings-repo.ts), [route.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/app/api/inventory/shopping/[id]/route.ts) ve [inventory-service.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/services/inventory-service.ts) güncellendi; `category`, `priority` (`high` | `normal` | `low`), `estimatedPrice`, `store`, `note`, `boughtAt`, `source: 'receipt_ai'` ve `PATCH` şema doğrulaması ile `undefined` temizliği (`omitUndefined`) eklendi.
- **Özet KPI & Yardımcılar**: [constants.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/constants.ts), [shopping-utils.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-utils.ts) ve [shopping-summary-stats.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-summary-stats.tsx) ile birim/öncelik/kategori sabitleri, toplam tutar/filtreleme/sıralama ve 4 kartlı `Stat` özet şeridi oluşturuldu.
- **Detaylı Ekleme & Düzenleme**: [shopping-form-schema.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-form-schema.ts), [shopping-add-form.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-add-form.tsx) ve [shopping-edit-dialog.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-edit-dialog.tsx) dosyalarında `Form`, `TextField`, `SelectField`, `AmountField`, `SubmitButton`, `zod` ve `react-hook-form` ile hızlı ekleme + açılabilir detay alanları ve modal düzenleme akışı kuruldu.
- **Profesyonel Tablo, Araç Çubuğu, Öneriler & Fiş Entegrasyonu**: [shopping-list-toolbar.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-list-toolbar.tsx), [shopping-list-row.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-list-row.tsx), [shopping-list-table.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-list-table.tsx), [shopping-suggestions.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-suggestions.tsx), [shopping-receipt-card.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-receipt-card.tsx), [use-shopping-screen.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/use-shopping-screen.ts) ve [screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/screen.tsx) ile durum sekmeleri, arama, öncelik filtresi, alınanları temizleme, satır içi `-`/`+` miktar kontrolü, envanter stoğuna işleme, önerileri toplu ekleme ve fiş kalemlerini zengin alanlarla aktarma eklendi.
- **Testler**: [shopping.test.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/tests/inventory/shopping.test.ts) genişletildi.

### Doğrulama Sonuçları
- Tüm shopping route ve test dosyaları 250 satır sınırının altında (en yüksek: `use-shopping-screen.ts`, 246 satır).
- `npm run type-check`: 0 hata.
- `npm run lint`: 0 hata, 0 uyarı.
- `npm test`: 14 test dosyası, 104 test geçti.
- `npm run metadata:check`: Başarılı (`All app routes expose metadata.`).
- `npm run build`: Next.js 16.4.6 Turbopack production build başarılı (36/36 statik sayfa üretildi).

---

## Faz 19 – Fiş Analiz Asistanı ve Alışveriş Formu Responsive & Hizalı Düzeni (İnceleme Özeti)

- **İki Kolonlu Form Hizalaması (`ReceiptImageField`, `ReceiptModelSelector`, `ReceiptAssistant`):**
  - `ReceiptModelSelector` ([receipt-model-selector.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-model-selector.tsx)) içindeki `size="icon"` (`44px`) yenileme butonunun etiket satırını büyüterek iki kolon arasında oluşturduğu dikey hiza kayması giderildi: etiket satırı yalnızca `OpenRouter Vision Modeli` başlığına indirgendi, yenileme butonu `SelectTrigger` ile aynı `44px` (`h-11`) satırına alındı ve `Sadece Ücretsiz` anahtarı + durum rozeti + model rozetleri seçim alanının altında düzenli bir meta satırına yerleştirildi.
  - `Fiş Görseli` alanı [receipt-image-field.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-image-field.tsx) bileşenine ayrılarak `SelectTrigger` ile birebir aynı `44px` (`h-11 min-h-[44px]`) yükseklik, `truncate` destekli dosya adı gösterimi ve tek tıkla değiştirme tetikleyicisi sağlandı; altındaki mükerrer dosya adı satırı kaldırıldı.
  - Grid kırılımı `grid-cols-1 items-start gap-4 md:grid-cols-2` olarak güncellendi; `ReceiptAssistant` ([receipt-assistant.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-assistant.tsx), [use-receipt-assistant.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/use-receipt-assistant.ts), [use-receipt-models.ts](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/use-receipt-models.ts)) `Form` + `zod` (`receiptAssistantFormSchema`) + `TextField` (`labelClassName` desteğiyle [text-field.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/forms/text-field.tsx)) + `SubmitButton` akışına geçirildi ve yüklenen görsel önizleme/aksiyon alanı mobilde tam genişlikte, masaüstünde sağa hizalı kart satırı olarak düzenlendi.
- **Sonuç Görünümü & Alışveriş Manuel Ekleme Formu:**
  - [receipt-result-meta.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-result-meta.tsx) (`sm:ml-auto`, `max-w-full truncate`) ve [receipt-result-view.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/components/ai/receipt-assistant/receipt-result-view.tsx) (`TabsList` yatay taşma koruması ve mobilde yığılan aksiyon barı) dar ekranlar için düzenlendi.
  - [shopping-add-form.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/shopping-add-form.tsx) ve [screen.tsx](file:///Users/zafergok/Documents/github/ZAFER/WEB/umay/src/features/routes/auth/shopping/screen.tsx) içindeki manuel ürün ekleme formu `Form` + `zod` şemasıyla mobilde hizalı iki satırlı, masaüstünde tek satırlı düzene geçirildi.
- **Doğrulama:**
  - Değiştirilen/eklenen tüm dosyalar `<= 250` satır (`wc -l`, en uzun dosya 225 satır).
  - `npm run type-check`, `npm run lint`, `npm test` (13 dosya, 102 test), `npm run metadata:check` ve `npm run build` sıfır hatayla geçti.

---

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
