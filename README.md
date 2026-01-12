# Albion Online Market Flip Table

Albion Online oyunu için market flip tablo yönetim sistemi. Bu sistem, oyuncuların market işlemlerini takip etmelerine, kar/zarar hesaplamaları yapmalarına ve istatistikleri görüntülemelerine olanak tanır.

## Özellikler

### Ana Özellikler
- ✅ Tablo oluşturma ve yönetimi
- ✅ Item ekleme, düzenleme ve silme
- ✅ Şehir bazlı fiyat takibi
- ✅ Premium/Premiumsuz tax hesaplamaları
- ✅ Buy Order / Sell Order desteği
- ✅ Version history (versiyon geçmişi)
- ✅ Detaylı istatistikler
- ✅ Responsive tasarım

### Teknik Özellikler
- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **UI Kütüphanesi:** shadcn/ui
- **Veritabanı:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **Stil:** Tailwind CSS

## Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd MarketFlipTable
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Supabase kurulumu:**
   - [Supabase](https://supabase.com) hesabı oluşturun
   - Yeni bir proje oluşturun
   - SQL Editor'de `supabase-schema.sql` dosyasındaki SQL'i çalıştırın

4. **Environment değişkenlerini ayarlayın:**
`.env.local` dosyası oluşturun:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Kullanım

### Tablo Oluşturma
1. Ana sayfada "Tablo Oluştur" butonuna tıklayın
2. Tablo detay bilgilerini girin (oluşturan kişi adı)
3. Market ayarlarını yapın (Premium, Buy/Sell Order)
4. Item ekleyin ve detaylarını girin
5. Her item için şehir bazlı fiyat bilgilerini ekleyin
6. Caerleon Black Market fiyatlarını girin
7. "Kaydet" butonuna tıklayın

### Tablo Düzenleme
1. Tablo detay sayfasında "Düzenle" butonuna tıklayın
2. İstediğiniz değişiklikleri yapın
3. "Kaydet" butonuna tıklayın (yeni versiyon oluşturulur)

### Versiyon Geçmişi
1. Tablo detay sayfasında "Versiyon Geçmişi" butonuna tıklayın
2. Önceki versiyonları görüntüleyin
3. İstediğiniz versiyonu yükleyin

### İstatistikler
- **Anasayfa:** Tüm tablolar için genel istatistikler
- **Tablo Detay:** O tabloya özel istatistikler
  - Toplam kar/zarar
  - En çok satılan ürünler
  - En çok kar ettiren ürünler
  - En düşük karlı ürünler

## Veritabanı Yapısı

### Tables
- `id`: UUID (Primary Key)
- `created_by`: TEXT (Tabloyu oluşturan kişi)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ
- `is_premium`: BOOLEAN
- `order_type`: TEXT ('buy_order' veya 'sell_order')
- `data`: JSONB (Tablo verileri)
- `version_number`: INTEGER

### Table Versions
- `id`: UUID (Primary Key)
- `table_id`: UUID (Foreign Key)
- `version_number`: INTEGER
- `created_at`: TIMESTAMPTZ
- `data`: JSONB (Versiyon verileri)

## Hesaplama Mantığı

### Tax Hesaplamaları
- **Premium Tax:** %4
- **Premiumsuz Tax:** %8
- **Market Tax (Satış):** %2.5
- **Setup Fee:** %2.5

### Buy Order
- Sadece Setup Fee uygulanır (%2.5)

### Sell Order
- Tax + Setup Fee uygulanır
- Premium: %4 + %2.5 = %6.5
- Premiumsuz: %8 + %2.5 = %10.5

## Deployment

### Vercel'e Deploy
1. GitHub'a push yapın
2. [Vercel](https://vercel.com) hesabınıza giriş yapın
3. Yeni proje oluşturun
4. Repository'yi bağlayın
5. Environment değişkenlerini ekleyin
6. Deploy edin

## Lisans

Bu proje özel kullanım içindir.

## Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request göndermeden önce:
1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Branch'inizi push edin
5. Pull request oluşturun
