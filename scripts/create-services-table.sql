-- Services (Hizmetler) Tablosu
-- Güzellik merkezi hizmetlerini tutar

USE sitenhaz_sitenhazirDb;
GO

-- Services Tablosu
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Services]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Services] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [title] NVARCHAR(200) NOT NULL,
        [slug] VARCHAR(250) NOT NULL UNIQUE,
        [excerpt] NVARCHAR(500) NULL,
        [content] NVARCHAR(MAX) NOT NULL,
        [image] VARCHAR(500) NULL,
        [published] BIT NOT NULL DEFAULT 0,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updatedAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    -- Slug için index (URL'den hızlı arama)
    CREATE INDEX IX_Services_Slug ON [dbo].[Services](slug);
    
    -- Published için index (frontend sorguları için)
    CREATE INDEX IX_Services_Published ON [dbo].[Services](published);
    
    PRINT 'Services tablosu başarıyla oluşturuldu.';
END
ELSE
BEGIN
    PRINT 'Services tablosu zaten mevcut.';
END
GO

-- Örnek veri ekle (opsiyonel - test için)
PRINT 'Services tablosu hazır. İlk hizmetleri admin panelinden ekleyebilirsiniz.';
GO

