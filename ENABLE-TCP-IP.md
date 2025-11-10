# SQL Server TCP/IP Protokolünü Etkinleştirme

## SQL Server Configuration Manager ile

1. **SQL Server Configuration Manager'ı açın:**
   - Windows tuşu + R → `SQLServerManager16.msc` (veya `SQLServerManager15.msc`, `SQLServerManager14.msc` vb.)
   - Veya: Başlat menüsünde "SQL Server Configuration Manager" ara

2. **SQL Server Network Configuration** → **Protocols for MSSQLSERVER** (veya **Protocols for SQLEXPRESS**)

3. **TCP/IP**'ye sağ tıklayın → **Enable**

4. **TCP/IP**'ye çift tıklayın → **IP Addresses** sekmesi

5. **IPAll** bölümünde:
   - **TCP Dynamic Ports**: Boş bırakın veya bir port numarası yazın (örn: 1433)
   - **TCP Port**: 1433 (veya istediğiniz port)

6. **OK** → SQL Server servisini yeniden başlatın

## Alternatif: SQL Server Management Studio'dan Port Bulma

1. SQL Server Management Studio'da bağlanın
2. Object Explorer'da server'a sağ tıklayın → **Properties**
3. **Connection** sekmesinde → **View connection properties**
4. Port numarasını görebilirsiniz

## Connection String'e Port Ekleme

Port numarasını bulduktan sonra `.env.local` dosyasını şu şekilde güncelleyin:

```env
DATABASE_URL="Data Source=localhost,1433;Initial Catalog=auraguzellikmerkezi2;Integrated Security=True;"
```

Veya SQL Server Express için:

```env
DATABASE_URL="Data Source=localhost,1433;Initial Catalog=auraguzellikmerkezi2;Integrated Security=True;"
```

