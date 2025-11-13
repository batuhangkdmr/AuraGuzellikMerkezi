# Veritabanı Taşıma Rehberi

Bu rehber, local veritabanından Güzelnet hosting MSSQL veritabanına taşıma işlemini açıklar.

## 📋 Adım 1: Mevcut Veritabanını Export Etme

1. **Export scriptini çalıştırın:**
   ```bash
   npm run export-db
   ```
   veya
   ```bash
   npx tsx scripts/export-database.ts
   ```

2. **Export dosyası oluşturulacak:**
   - Konum: `database-export/database-export.sql`
   - Bu dosya tüm tabloları, verileri ve constraint'leri içerir

## 📋 Adım 2: Yeni Veritabanı Bağlantı Bilgilerini Ayarlama

Resimlerdeki bilgilere göre:
- **Host:** `.\\MSSQLSERVER2019:0` (Bu format düzeltilmeli - aşağıya bakın)
- **Veritabanı:** `sitenhaz_sitenhazirDb`
- **Kullanıcı:** `sitenhaz_sitenhazir`
- **Şifre:** (Güzelnet panelinden alın)

### ⚠️ Önemli: Host Formatı

Resimdeki host formatı (`.\\MSSQLSERVER2019:0`) standart değil. Güzelnet panelinden doğru bağlantı bilgilerini almanız gerekiyor. Genellikle şu formatlardan biri olur:

1. **Server,Port formatı:** `server.com,1433` veya `IP_ADDRESS,1433`
2. **Server\\Instance formatı:** `server\\SQLEXPRESS`
3. **Sadece server:** `server.com` (default port 1433)

Güzelnet panelinden doğru formatı öğrenin.

## 📋 Adım 3: .env.local Dosyasını Güncelleme

Yeni veritabanı için `.env.local` dosyanızı güncelleyin:

### Seçenek 1: SQL Server Authentication (Kullanıcı adı/şifre)

```env
DATABASE_URL="Server=HOST_ADRESI,PORT;Database=sitenhaz_sitenhazirDb;User Id=sitenhaz_sitenhazir;Password=ŞİFRENİZ;Encrypt=true;TrustServerCertificate=true;"
```

**Örnek:**
```env
DATABASE_URL="Server=sql.guzelnet.com,1433;Database=sitenhaz_sitenhazirDb;User Id=sitenhaz_sitenhazir;Password=your_password;Encrypt=true;TrustServerCertificate=true;"
```

### Seçenek 2: ASP.NET Core Format

```env
DATABASE_URL="Data Source=HOST_ADRESI,PORT;Initial Catalog=sitenhaz_sitenhazirDb;User ID=sitenhaz_sitenhazir;Password=ŞİFRENİZ;Encrypt=True;TrustServerCertificate=True;"
```

**Örnek:**
```env
DATABASE_URL="Data Source=sql.guzelnet.com,1433;Initial Catalog=sitenhaz_sitenhazirDb;User ID=sitenhaz_sitenhazir;Password=your_password;Encrypt=True;TrustServerCertificate=True;"
```

### Host Adresini Bulma

Güzelnet panelindeki "Bağlantı bilgisi" dialogunda:
- **Host** değerini kontrol edin
- Eğer `.\\MSSQLSERVER2019:0` gibi bir format görüyorsanız, bu muhtemelen local server için
- Remote server için genellikle bir domain veya IP adresi olmalı (örn: `sql.guzelnet.com` veya `123.45.67.89`)

## 📋 Adım 4: Yeni Veritabanına Bağlantıyı Test Etme

1. **Bağlantıyı test edin:**
   ```bash
   npm run check-tables
   ```

2. **Eğer bağlantı başarısız olursa:**
   - Host adresini kontrol edin
   - Port numarasını kontrol edin (genellikle 1433)
   - Firewall ayarlarını kontrol edin
   - Güzelnet panelinden doğru bilgileri aldığınızdan emin olun

## 📋 Adım 5: Export Edilen SQL Dosyasını Yeni Veritabanına Import Etme

### Yöntem 1: SQL Server Management Studio (SSMS) ile

1. **SSMS'i açın** ve yeni veritabanına bağlanın
2. **File → Open → File** ile `database-export/database-export.sql` dosyasını açın
3. **Execute** (F5) ile scripti çalıştırın

### Yöntem 2: Komut satırı ile (sqlcmd)

```bash
sqlcmd -S HOST_ADRESI,PORT -U sitenhaz_sitenhazir -P ŞİFRENİZ -d sitenhaz_sitenhazirDb -i database-export/database-export.sql
```

### Yöntem 3: Node.js script ile

Bir import scripti oluşturabiliriz (isteğe bağlı).

## 📋 Adım 6: Verilerin Doğrulanması

1. **Tabloları kontrol edin:**
   ```bash
   npm run check-tables
   ```

2. **Veri sayılarını kontrol edin:**
   - Her tablodaki kayıt sayısını kontrol edin
   - Önemli verilerin (kullanıcılar, ürünler, siparişler) taşındığından emin olun

## 📋 Adım 7: Uygulamayı Test Etme

1. **Development server'ı başlatın:**
   ```bash
   npm run dev
   ```

2. **Test edin:**
   - Ürün listesini kontrol edin
   - Kullanıcı girişini test edin
   - Admin panelini kontrol edin
   - Sipariş işlemlerini test edin

## 🔧 Sorun Giderme

### Bağlantı Hatası: "Cannot connect to server"

1. **Host adresini kontrol edin:**
   - Güzelnet panelinden doğru host adresini alın
   - Port numarasını kontrol edin (genellikle 1433)

2. **Firewall ayarlarını kontrol edin:**
   - Güzelnet panelinde IP whitelist ayarlarını kontrol edin
   - Kendi IP adresinizi eklemeniz gerekebilir

3. **Encryption ayarlarını kontrol edin:**
   - `Encrypt=true` ve `TrustServerCertificate=true` parametrelerini ekleyin

### Bağlantı Hatası: "Login failed for user"

1. **Kullanıcı adı ve şifreyi kontrol edin:**
   - Güzelnet panelinden doğru bilgileri alın
   - Şifrede özel karakterler varsa URL encode edin

2. **Veritabanı adını kontrol edin:**
   - `sitenhaz_sitenhazirDb` doğru mu?

### Tablo Bulunamadı Hatası

1. **SQL script'inin çalıştırıldığından emin olun:**
   - `database-export/database-export.sql` dosyasını yeni veritabanında çalıştırdınız mı?

2. **Tablo isimlerini kontrol edin:**
   - Bazı hosting'lerde tablo isimleri case-sensitive olabilir

## 📝 Notlar

- **Yedekleme:** Taşıma işleminden önce local veritabanınızın yedeğini alın
- **Test:** Önce test veritabanında deneyin, sonra production'a geçin
- **Downtime:** Taşıma işlemi sırasında uygulamanızı kapatmanız gerekebilir
- **DNS:** Production'a geçtiğinizde domain'in DNS ayarlarını güncelleyin

## 🆘 Yardım

Eğer sorun yaşarsanız:
1. Hata mesajını tam olarak paylaşın
2. `.env.local` dosyanızdaki `DATABASE_URL` değerini (şifre hariç) paylaşın
3. Güzelnet panelindeki bağlantı bilgilerini kontrol edin

