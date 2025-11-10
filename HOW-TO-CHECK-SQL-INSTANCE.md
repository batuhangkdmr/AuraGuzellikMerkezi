# SQL Server Instance Kontrolü

## SQL Server Management Studio'da Kontrol

1. **SQL Server Management Studio'yu açın**

2. **"Connect to Server" penceresinde:**
   - **Server name** alanına bakın
   - Örnekler:
     - `(localdb)\MSSQLLocalDB` → LocalDB kullanıyorsunuz
     - `DESKTOP-2DM1JI8\SQLEXPRESS` → SQL Server Express kullanıyorsunuz
     - `DESKTOP-2DM1JI8` → Default instance kullanıyorsunuz
     - `localhost\MSSQLSERVER01` → Named instance kullanıyorsunuz

3. **Bağlandıktan sonra:**
   - Object Explorer'da sağ üstte server adını görebilirsiniz
   - Veya sağ tıklayıp "Properties" → "General" sekmesinde görebilirsiniz

## Terminal'den Kontrol

Aşağıdaki komutları çalıştırabilirsiniz:

```powershell
# Tüm SQL Server instance'larını listele
Get-Service | Where-Object {$_.DisplayName -like "*SQL Server*"} | Select-Object Name, Status, DisplayName

# LocalDB instance'larını listele
sqllocaldb info

# Belirli bir LocalDB instance'ının detaylarını göster
sqllocaldb info MSSQLLocalDB
```

## .env.local Dosyasını Güncelleme

SQL Server Management Studio'da gördüğünüz **Server name** değerini kullanarak `.env.local` dosyasını güncelleyin:

### Örnek 1: LocalDB
```env
DATABASE_URL="Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=auraguzellikmerkezi2;Integrated Security=True;"
```

### Örnek 2: SQL Server Express
```env
DATABASE_URL="Data Source=DESKTOP-2DM1JI8\SQLEXPRESS;Initial Catalog=auraguzellikmerkezi2;Integrated Security=True;"
```

### Örnek 3: Default Instance
```env
DATABASE_URL="Data Source=DESKTOP-2DM1JI8;Initial Catalog=auraguzellikmerkezi2;Integrated Security=True;"
```

### Örnek 4: Named Instance
```env
DATABASE_URL="Data Source=localhost\MSSQLSERVER01;Initial Catalog=auraguzellikmerkezi2;Integrated Security=True;"
```

