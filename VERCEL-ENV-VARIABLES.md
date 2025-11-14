# Vercel Environment Variables Yapılandırması

## Mevcut Durum
Vercel'de ayrı ayrı environment variable'lar tanımlanmış:
- `DB_SERVER`
- `DB_DATABASE`
- `DB_USER`
- `DB_PASSWORD`

## Çözüm 1: DATABASE_URL Oluşturma (Önerilen)

Vercel'de yeni bir environment variable ekleyin:

**Variable Name:** `DATABASE_URL`

**Variable Value:**
```
Server=104.247.167.194\MSSQLSERVER2019;Database=sitenhaz_sitenhazirD;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxirp@Mbw;
```

**Alternatif Format (ASP.NET Core style):**
```
Data Source=104.247.167.194\MSSQLSERVER2019;Initial Catalog=sitenhaz_sitenhazirD;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxirp@Mbw;
```

## Çözüm 2: Kod Güncellemesi (Otomatik Destek)

Kod güncellendi, artık ayrı ayrı environment variable'ları da destekliyor:
- `DB_SERVER` veya `DATABASE_URL`
- `DB_DATABASE`
- `DB_USER`
- `DB_PASSWORD`

Eğer `DATABASE_URL` yoksa, ayrı ayrı değişkenlerden otomatik olarak connection string oluşturulur.

## Port Belirtme

Eğer SQL Server farklı bir portta çalışıyorsa (varsayılan 1433 değilse), portu da ekleyin:

**Format:**
```
Server=104.247.167.194\MSSQLSERVER2019,1433;Database=sitenhaz_sitenhazirD;User Id=sitenhaz_sitenhazir;Password=H2!Zh86dzxirp@Mbw;
```

## Notlar

1. Database adında bir typo var: `sitenhaz_sitenhazirD` (sonunda büyük D var)
2. Şifre içinde özel karakterler var (`!`, `@`), bu yüzden URL encoding gerekebilir
3. Named instance kullanılıyor: `MSSQLSERVER2019`
4. Vercel'de environment variable'ları ekledikten sonra **redeploy** yapmanız gerekiyor

