npm inpm # E-Commerce Sistem Kurulumu

## ✅ Tamamlanan Özellikler

### Backend
- ✅ Veritabanı bağlantısı (MSSQL - LocalDB desteği)
- ✅ Repository Pattern (User, Product, Cart, Order)
- ✅ Authentication sistemi (JWT + HTTP-only cookies)
- ✅ Server Actions (auth, products, cart, orders, admin)

### Frontend
- ✅ Ürün listesi sayfası (`/products`)
- ✅ Ürün detay sayfası (`/products/[slug]`)
- ✅ Sepet sayfası (`/cart`)
- ✅ Ödeme sayfası (`/checkout`)
- ✅ Kullanıcı profili (`/profile`)
- ✅ Sipariş detay sayfası (`/profile/orders/[id]`)

### Admin Panel
- ✅ Ürün yönetimi (`/admin/products`)
- ✅ Sipariş yönetimi (`/admin/orders`)
- ✅ Ürün ekleme/düzenleme/silme

### Diğer
- ✅ CartContext (Client-side sepet yönetimi)
- ✅ Guest sepet desteği (session-based)
- ✅ Sepet birleştirme (login sonrası)

## 🚀 Kurulum Adımları

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Veritabanı Bağlantısını Yapılandırın

`.env.local` dosyanızda `DATABASE_URL` değişkenini kontrol edin:

```env
DATABASE_URL="Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=auraguzellikmerkezi1;Integrated Security=True;"
```

Veya SQL Server için:
```env
DATABASE_URL="Data Source=localhost\\MSSQLSERVER01;Initial Catalog=auraguzellikmerkezi1;Integrated Security=True;"
```

### 3. Veritabanını Oluşturun

```bash
npm run setup-db
```

Bu komut:
- Tüm tabloları oluşturur
- Admin kullanıcı oluşturur (admin@aura.test / admin123)
- Örnek ürünler ekler

### 4. Uygulamayı Başlatın

```bash
npm run dev
```

## 📝 Varsayılan Admin Hesabı

- **E-posta:** admin@aura.test
- **Şifre:** admin123
- **Rol:** ADMIN

## 🗂️ Veritabanı Yapısı

### Tablolar
- `users` - Kullanıcılar
- `products` - Ürünler
- `cart_items` - Sepet öğeleri
- `orders` - Siparişler
- `order_items` - Sipariş öğeleri

## 🔐 Güvenlik

- JWT token'lar HTTP-only cookie'lerde saklanır
- Şifreler bcrypt ile hash'lenir (salt rounds: 12)
- Server Actions ile form validasyonu (Zod)
- Role-based access control (ADMIN/USER)

## 📦 Paketler

### Ana Bağımlılıklar
- `next` - Next.js framework
- `mssql` - SQL Server bağlantısı
- `jose` - JWT işlemleri
- `bcryptjs` - Şifre hash'leme
- `zod` - Validasyon
- `react-hook-form` - Form yönetimi
- `uuid` - Session ID oluşturma

## 🛠️ Geliştirme

### Yeni Ürün Ekleme
1. `/admin/products` sayfasına gidin
2. "Yeni Ürün Ekle" butonuna tıklayın
3. Formu doldurun ve kaydedin

### Sipariş Yönetimi
1. `/admin/orders` sayfasından tüm siparişleri görüntüleyin
2. Sipariş detayına tıklayarak detayları görüntüleyin
3. Sipariş durumunu güncelleyin (PENDING → CONFIRMED → SHIPPED → DELIVERED)

## ⚠️ Notlar

- LocalDB kullanıyorsanız, MSSQL Server LocalDB'nin çalıştığından emin olun
- Production'da `JWT_SECRET` değişkenini güvenli bir değerle değiştirin
- HTTPS kullanın (production'da `secure` cookie flag'i aktif olacak)

## 🐛 Sorun Giderme

### Veritabanı Bağlantı Hatası
- `.env.local` dosyasındaki `DATABASE_URL` değerini kontrol edin
- LocalDB servisinin çalıştığından emin olun
- SQL Server'ın çalıştığından emin olun

### Tablolar Oluşmadı
- `npm run setup-db` komutunu tekrar çalıştırın
- Veritabanının var olduğundan emin olun
- SQL Server Management Studio'dan manuel kontrol edin

### Paket Hataları
- `node_modules` klasörünü silin ve `npm install` çalıştırın
- Node.js versiyonunuzu kontrol edin (18+ önerilir)

