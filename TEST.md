# Test Checklist

## ✅ Supabase Kurulumu
- [x] SQL schema çalıştırıldı
- [ ] Tablolar Table Editor'da görünüyor mu? (`tables`, `table_versions`)

## ✅ Vercel Environment Variables
- [x] NEXT_PUBLIC_SUPABASE_URL eklendi
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY eklendi

## 🧪 Uygulama Testleri

### 1. Ana Sayfa Testi
- [ ] Ana sayfa açılıyor mu?
- [ ] "Tablo Oluştur" butonu görünüyor mu?
- [ ] İstatistikler bölümü görünüyor mu?

### 2. Tablo Oluşturma Testi
- [ ] "Tablo Oluştur" butonuna tıklanabiliyor mu?
- [ ] Form açılıyor mu?
- [ ] Tablo detay bilgileri girilebiliyor mu?
- [ ] Item eklenebiliyor mu?
- [ ] Şehir eklenebiliyor mu?
- [ ] Caerleon Black Market bilgileri girilebiliyor mu?
- [ ] "Kaydet" butonu çalışıyor mu?
- [ ] Tablo başarıyla oluşturuluyor mu?

### 3. Tablo Detay Sayfası Testi
- [ ] Tablo detay sayfası açılıyor mu?
- [ ] Tablo bilgileri görüntüleniyor mu?
- [ ] İstatistikler görüntüleniyor mu?
- [ ] "Düzenle" butonu çalışıyor mu?
- [ ] Düzenleme yapılabiliyor mu?
- [ ] "Kaydet" butonu çalışıyor mu?
- [ ] Yeni versiyon oluşturuluyor mu?

### 4. Version History Testi
- [ ] "Versiyon Geçmişi" butonu çalışıyor mu?
- [ ] Versiyonlar listeleniyor mu?
- [ ] Önceki versiyon yüklenebiliyor mu?

### 5. İstatistikler Testi
- [ ] Anasayfada genel istatistikler görünüyor mu?
- [ ] Tablo detay sayfasında istatistikler görünüyor mu?
- [ ] Kar/zarar hesaplamaları doğru mu?

## 🐛 Hata Kontrolü
- [ ] Console'da hata var mı? (F12 → Console)
- [ ] Network istekleri başarılı mı? (F12 → Network)
- [ ] Supabase'de veriler kaydediliyor mu?
