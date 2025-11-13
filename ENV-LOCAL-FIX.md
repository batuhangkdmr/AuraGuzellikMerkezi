# .env.local Dosyası Düzeltme

## Sorun
Port 1433 ile bağlanmaya çalışırken timeout hatası alınıyor. Bu, SQL Server Browser'ın remote bağlantılar için erişilebilir olmamasından kaynaklanıyor.

## Çözüm

### Seçenek 1: Port Numarasını Belirtin (Önerilen)
Güzelnet panelinden doğru port numarasını öğrenin ve connection string'e ekleyin:

```env
DATABASE_URL="Server=104.247.167.194\\MSSQLSERVER2019,1433;Database=sitenhaz_sitenhazirDb;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxrp@Mbw;Encrypt=true;TrustServerCertificate=true;"
```

**Not:** `Server=IP\Instance,Port` formatı kullanın. Port numarasını virgülle ayırın.

### Seçenek 2: Sadece Port Kullanın (Named Instance Olmadan)
Eğer port numarasını biliyorsanız, named instance yerine sadece port kullanın:

```env
DATABASE_URL="Server=104.247.167.194,PORT_NUMARASI;Database=sitenhaz_sitenhazirDb;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxrp@Mbw;Encrypt=true;TrustServerCertificate=true;"
```

**Örnek:** Port 1433 ise:
```env
DATABASE_URL="Server=104.247.167.194,1433;Database=sitenhaz_sitenhazirDb;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxrp@Mbw;Encrypt=true;TrustServerCertificate=true;"
```

### Seçenek 3: Güzelnet Panelinden Doğru Bilgileri Alın
1. Güzelnet panelinde "Bağlantı bilgisi" bölümünü açın
2. Port numarasını kontrol edin
3. Eğer farklı bir format varsa (örn: `sql.guzelnet.com` veya başka bir domain), o formatı kullanın

## Test
Bağlantıyı test etmek için:
```bash
npm run check-tables
```

## Debug
Uygulamayı çalıştırdığınızda console'da şu log'u göreceksiniz:
```
🔍 SQL Connection Config: { server: ..., database: ..., port: ..., instanceName: ... }
```

Bu log, hangi config'in kullanıldığını gösterir.

## Önemli Notlar
- SQL Server Browser (UDP port 1434) remote bağlantılar için genellikle kapalıdır
- Named instance kullanırken port numarasını belirtmek gerekebilir
- Firewall/IP whitelist ayarlarını kontrol edin
- Port numarasını Güzelnet panelinden öğrenin

