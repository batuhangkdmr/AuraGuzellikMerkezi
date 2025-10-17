# 💅 Aura Güzellik Merkezi

Modern ve kullanıcı dostu güzellik salonu web sitesi ve yönetim sistemi.

## 🎯 Özellikler

### 🌐 Frontend
- **Ana Sayfa:** Modern ve çekici landing page
- **Hizmetlerimiz:** Sunulan hizmetlerin detaylı tanıtımı
- **Blog:** SEO uyumlu blog sistemi
- **Hakkımızda:** Salon ve ekip tanıtımı
- **Randevu:** Online randevu alma formu
- **İletişim:** İletişim formu ve bilgileri

### 🔐 Admin Panel
- **Blog Yönetimi:** CRUD işlemleri (Oluştur, Oku, Güncelle, Sil)
- **Hizmet Yönetimi:** Hizmet ekleme ve düzenleme
- **Randevu Yönetimi:** Randevu takibi
- **Resim Yükleme:** Cloudinary entegrasyonu ile resim yönetimi

## 🛠️ Teknolojiler

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Dil:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Microsoft SQL Server](https://www.microsoft.com/sql-server)
- **ORM:** `mssql` package (Repository Pattern)
- **Image Upload:** [Cloudinary](https://cloudinary.com/)
- **Form Validation:** React Hook Form + Zod (planlanan)
- **Animations:** Framer Motion (planlanan)

## 📋 Gereksinimler

- Node.js 18.x veya üzeri
- MSSQL Server 2019 veya üzeri
- Cloudinary hesabı (resim yükleme için)

## 🚀 Kurulum

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/batuhangkdmr/AuraGuzellikMerkezi.git
cd AuraGuzellikMerkezi
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Veritabanını Oluşturun

SSMS (SQL Server Management Studio) ile:

1. `scripts/create-database.sql` dosyasını açın
2. İlk satırı kendi veritabanı adınıza göre düzenleyin
3. Scripti çalıştırın

### 5. Veritabanı Bağlantısını Yapılandırın

`lib/repositories/BlogRepository.ts` dosyasındaki connection string'i düzenleyin:

```typescript
const config: sql.config = {
  server: 'your_server',
  database: 'your_database',
  user: 'your_username',
  password: 'your_password',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};
```

### 6. Development Server'ı Başlatın

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## 📁 Proje Yapısı

```
AuraGuzellikMerkezi/
├── app/
│   ├── (admin)/          # Admin panel rotaları
│   │   └── admin/
│   │       ├── blog/     # Blog yönetimi
│   │       ├── hizmetler/
│   │       └── randevular/
│   ├── (frontend)/       # Genel site rotaları
│   │   ├── blog/
│   │   ├── hakkimizda/
│   │   ├── hizmetlerimiz/
│   │   ├── randevu/
│   │   └── iletisim/
│   ├── globals.css
│   └── layout.tsx
├── components/           # Paylaşılan React komponentleri
├── lib/
│   ├── models/          # TypeScript interface'leri
│   └── repositories/    # Veritabanı erişim katmanı
├── scripts/
│   └── create-database.sql  # Veritabanı oluşturma scripti
└── public/              # Statik dosyalar
```

## 🎨 Özellikler ve Kullanım

### Blog Sistemi

- **Oluşturma:** Admin panelden yeni blog yazısı ekleyin
- **Resim Yükleme:** Cloudinary ile optimize edilmiş resim yükleme
- **SEO Friendly:** Otomatik slug oluşturma (Türkçe karakter desteği)
- **Taslak/Yayın:** Blog yazılarını taslak olarak kaydedebilme

### Resim Yönetimi

- Cloudinary entegrasyonu ile hızlı ve güvenli yükleme
- Otomatik optimizasyon
- Resim boyutlandırma ve dönüştürme
- CDN desteği

## 🔒 Güvenlik

- Server-side validasyon
- SQL injection koruması (parametreli sorgular)
- XSS koruması
- CORS yapılandırması

## 🌐 Deployment

### Vercel (Önerilen)

1. GitHub repository'nizi Vercel'e bağlayın
2. Ortam değişkenlerini ekleyin
3. Deploy edin

### Diğer Platformlar

- Azure App Service
- AWS Amplify
- DigitalOcean App Platform

> **Not:** MSSQL Server için erişilebilir bir host gereklidir.

## 📝 Yapılacaklar

- [ ] NextAuth.js ile admin kimlik doğrulama
- [ ] Email bildirimleri (randevu onayları)
- [ ] Galeri sistemi
- [ ] Çoklu dil desteği
- [ ] Dark mode
- [ ] Gelişmiş arama ve filtreleme
- [ ] Dashboard istatistikleri

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje [MIT](LICENSE) lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Batuhan Gediktemir**
- GitHub: [@batuhangkdmr](https://github.com/batuhangkdmr)

## 🙏 Teşekkürler

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Cloudinary](https://cloudinary.com/)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server)

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
