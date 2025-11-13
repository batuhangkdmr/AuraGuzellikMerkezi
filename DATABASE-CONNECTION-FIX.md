# Veritabanı Bağlantı Sorunu Çözümü

## Sorun
Port 1433 ile bağlanmaya çalışırken timeout hatası alınıyor.

## Çözüm Seçenekleri

### Seçenek 1: Named Instance Formatı (Önerilen)
`.env.local` dosyanızı şu formatta güncelleyin:

```env
DATABASE_URL="Server=104.247.167.194\\MSSQLSERVER2019;Database=sitenhaz_sitenhazirDb;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxrp@Mbw;Encrypt=true;TrustServerCertificate=true;"
```

**Not:** `\\` (çift backslash) kullanın, tek `\` değil!

### Seçenek 2: Port ile (Eğer port farklıysa)
Güzelnet panelinden doğru port numarasını öğrenin ve şu formatta kullanın:

```env
DATABASE_URL="Server=104.247.167.194,PORT_NUMARASI;Database=sitenhaz_sitenhazirDb;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxrp@Mbw;Encrypt=true;TrustServerCertificate=true;"
```

### Seçenek 3: Firewall/IP Whitelist
Güzelnet panelinde:
1. Firewall ayarlarını kontrol edin
2. Kendi IP adresinizi whitelist'e ekleyin
3. SQL Server'ın remote bağlantıları kabul ettiğinden emin olun

### Seçenek 4: Güzelnet Panelinden Doğru Bilgileri Alın
Güzelnet panelindeki "Bağlantı bilgisi" bölümünden:
- Host adresini kontrol edin
- Port numarasını kontrol edin
- Named instance adını kontrol edin

## Test
Bağlantıyı test etmek için:
```bash
npm run check-tables
```

## Notlar
- Connection timeout'u 30 saniyeye çıkardık
- Named instance kullanıldığında port belirtmeye gerek yok
- Firewall sorunları bağlantıyı engelleyebilir

