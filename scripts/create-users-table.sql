-- Users Tablosu Oluşturma
-- Authentication sistemi için kullanıcı bilgilerini tutar

USE sitenhaz_sitenhazirDb;
GO

-- Users Tablosu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [username] NVARCHAR(50) NOT NULL UNIQUE,
        [password] VARCHAR(255) NOT NULL,
        [role] VARCHAR(20) NOT NULL DEFAULT 'user',
        [lastLoginAt] DATETIME2 NULL,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Username için index oluştur (hızlı arama için)
    CREATE INDEX IX_Users_Username ON [dbo].[Users](username);
    
    -- Role için index oluştur
    CREATE INDEX IX_Users_Role ON [dbo].[Users](role);
    
    PRINT 'Users tablosu başarıyla oluşturuldu.';
END
ELSE
BEGIN
    PRINT 'Users tablosu zaten mevcut.';
END
GO

-- İlk admin kullanıcısını ekle (şifre: admin123)
-- NOT: Bu şifre hash'lenmiş haliyle eklenecek, şimdilik placeholder
-- UserRepository.ts'den seed işlemi yapılacak
PRINT 'Users tablosu hazır. İlk admin kullanıcısını uygulama üzerinden ekleyin.';
GO

