# Deployment Guide

## GitHub Repository Oluşturma

1. GitHub'da yeni bir repository oluşturun
2. Repository adını belirleyin (örn: `albion-market-flip-table`)
3. Repository'yi public veya private olarak ayarlayın

## GitHub'a Push

Repository oluşturduktan sonra, aşağıdaki komutları çalıştırın:

```bash
git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
git branch -M main
git push -u origin main
```

## Vercel Deployment

### 1. Vercel'e Bağlama
1. [Vercel](https://vercel.com) hesabınıza giriş yapın
2. "New Project" butonuna tıklayın
3. GitHub repository'nizi seçin
4. "Import" butonuna tıklayın

### 2. Project Settings
- **Framework Preset:** Next.js (otomatik algılanır)
- **Root Directory:** `./` (varsayılan)
- **Build Command:** `npm run build` (varsayılan)
- **Output Directory:** `.next` (varsayılan)

### 3. Environment Variables
Vercel dashboard'da "Settings" > "Environment Variables" bölümüne gidin ve şunları ekleyin:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Not:** Production, Preview ve Development için aynı değerleri ekleyin.

## Supabase Entegrasyonu

### 1. Supabase Projesi Oluşturma
1. [Supabase](https://supabase.com) hesabınıza giriş yapın
2. "New Project" butonuna tıklayın
3. Proje bilgilerini girin:
   - **Name:** Albion Market Flip Table
   - **Database Password:** Güçlü bir şifre seçin
   - **Region:** Size en yakın bölgeyi seçin

### 2. Database Schema Kurulumu
1. Supabase dashboard'da "SQL Editor" bölümüne gidin
2. `supabase-schema.sql` dosyasındaki SQL kodunu kopyalayın
3. SQL Editor'de yeni bir query oluşturun
4. SQL kodunu yapıştırın ve "Run" butonuna tıklayın

### 3. API Keys Alma
1. Supabase dashboard'da "Settings" > "API" bölümüne gidin
2. **Project URL** değerini kopyalayın (NEXT_PUBLIC_SUPABASE_URL)
3. **anon/public** key'i kopyalayın (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Vercel'de Environment Variables Güncelleme
1. Vercel dashboard'da projenize gidin
2. "Settings" > "Environment Variables" bölümüne gidin
3. Supabase'den aldığınız değerleri ekleyin/güncelleyin
4. "Redeploy" butonuna tıklayın

## Post-Deployment Kontrol

1. Vercel deployment'ın başarılı olduğunu kontrol edin
2. Uygulamanızı açın ve test edin:
   - Tablo oluşturma
   - Item ekleme
   - İstatistikler görüntüleme
3. Supabase'de verilerin kaydedildiğini kontrol edin:
   - "Table Editor" bölümünde `tables` ve `table_versions` tablolarını kontrol edin

## Troubleshooting

### Build Hataları
- Environment variables'ın doğru eklendiğinden emin olun
- `npm install` komutunun başarılı çalıştığından emin olun

### Database Bağlantı Hataları
- Supabase URL ve Key'lerin doğru olduğundan emin olun
- Supabase'de Row Level Security (RLS) policy'lerinin aktif olduğundan emin olun
- Supabase'de network restrictions olmadığından emin olun

### CORS Hataları
- Supabase'de API settings'de CORS ayarlarını kontrol edin
- Vercel domain'inin Supabase'de allowed origins listesinde olduğundan emin olun
