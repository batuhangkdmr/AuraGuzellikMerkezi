# Veritabanı Taşıma Adımları

## Adım 1: Local Veritabanından Export

1. `.env.local` dosyanızı geçici olarak local veritabanına ayarlayın:
   ```env
   DATABASE_URL="Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=VERITABANI_ADI;Integrated Security=True;"
   ```
   veya
   ```env
   DATABASE_URL="Server=localhost;Database=VERITABANI_ADI;Integrated Security=True;"
   ```

2. Export işlemini çalıştırın:
   ```bash
   npm run export-db
   ```

3. Export tamamlandıktan sonra `.env.local` dosyanızı tekrar yeni veritabanına geri çevirin:
   ```env
   DATABASE_URL="Server=104.247.167.194,1433;Database=sitenhaz_sitenhazirDb;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxrp@Mbw;Encrypt=true;TrustServerCertificate=true;"
   ```

## Adım 2: Yeni Veritabanına Import

1. Import işlemini çalıştırın:
   ```bash
   npm run import-db
   ```

2. Tabloları kontrol edin:
   ```bash
   npm run check-tables
   ```

## Notlar

- Export dosyası `database-export/database-export.sql` konumunda oluşturulacak
- Import işlemi sırasında bazı hatalar görünebilir (örn: "table already exists") - bunlar normaldir
- Verilerin doğru taşındığından emin olmak için import sonrası kontrol edin

