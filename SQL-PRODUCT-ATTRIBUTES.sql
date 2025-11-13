-- =============================================
-- Ürün Özellikleri ve Filtreleme Sistemi
-- =============================================
-- Bu script, Trendyol benzeri ürün filtreleme sistemi için
-- gerekli tabloları oluşturur.
-- =============================================

USE [AuraGuzellikMerkezi]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

BEGIN TRY
    BEGIN TRANSACTION;

    -- =============================================
    -- Step 1: product_attributes tablosunu oluştur
    -- =============================================
    IF NOT EXISTS (
        SELECT * FROM sys.tables 
        WHERE name = 'product_attributes' AND type = 'U'
    )
    BEGIN
        CREATE TABLE [dbo].[product_attributes] (
            [id] INT IDENTITY(1,1) NOT NULL,
            [name] NVARCHAR(100) NOT NULL,
            [slug] NVARCHAR(100) NOT NULL,
            [type] NVARCHAR(20) NOT NULL DEFAULT 'text', -- text, number, color, boolean
            [display_order] INT NOT NULL DEFAULT 0,
            [is_active] BIT NOT NULL DEFAULT 1,
            [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
            [updated_at] DATETIME NOT NULL DEFAULT GETDATE(),
            
            CONSTRAINT [PK_product_attributes] PRIMARY KEY CLUSTERED ([id] ASC),
            CONSTRAINT [UQ_product_attributes_slug] UNIQUE ([slug])
        );

        PRINT '✓ product_attributes tablosu oluşturuldu.';
    END
    ELSE
    BEGIN
        PRINT '⚠ product_attributes tablosu zaten mevcut.';
    END

    -- =============================================
    -- Step 2: attribute_values tablosunu oluştur
    -- =============================================
    IF NOT EXISTS (
        SELECT * FROM sys.tables 
        WHERE name = 'attribute_values' AND type = 'U'
    )
    BEGIN
        CREATE TABLE [dbo].[attribute_values] (
            [id] INT IDENTITY(1,1) NOT NULL,
            [attribute_id] INT NOT NULL,
            [value] NVARCHAR(200) NOT NULL,
            [slug] NVARCHAR(200) NOT NULL,
            [color_code] NVARCHAR(7) NULL, -- Hex color code for color type attributes
            [display_order] INT NOT NULL DEFAULT 0,
            [is_active] BIT NOT NULL DEFAULT 1,
            [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
            
            CONSTRAINT [PK_attribute_values] PRIMARY KEY CLUSTERED ([id] ASC),
            CONSTRAINT [FK_attribute_values_attribute] FOREIGN KEY ([attribute_id])
                REFERENCES [dbo].[product_attributes] ([id])
                ON DELETE CASCADE,
            CONSTRAINT [UQ_attribute_values_slug] UNIQUE ([attribute_id], [slug])
        );

        PRINT '✓ attribute_values tablosu oluşturuldu.';
    END
    ELSE
    BEGIN
        PRINT '⚠ attribute_values tablosu zaten mevcut.';
    END

    -- =============================================
    -- Step 3: product_attribute_values tablosunu oluştur
    -- =============================================
    IF NOT EXISTS (
        SELECT * FROM sys.tables 
        WHERE name = 'product_attribute_values' AND type = 'U'
    )
    BEGIN
        CREATE TABLE [dbo].[product_attribute_values] (
            [id] INT IDENTITY(1,1) NOT NULL,
            [product_id] INT NOT NULL,
            [attribute_value_id] INT NOT NULL,
            [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
            
            CONSTRAINT [PK_product_attribute_values] PRIMARY KEY CLUSTERED ([id] ASC),
            CONSTRAINT [FK_product_attribute_values_product] FOREIGN KEY ([product_id])
                REFERENCES [dbo].[products] ([id])
                ON DELETE CASCADE,
            CONSTRAINT [FK_product_attribute_values_value] FOREIGN KEY ([attribute_value_id])
                REFERENCES [dbo].[attribute_values] ([id])
                ON DELETE CASCADE,
            CONSTRAINT [UQ_product_attribute_values] UNIQUE ([product_id], [attribute_value_id])
        );

        PRINT '✓ product_attribute_values tablosu oluşturuldu.';
    END
    ELSE
    BEGIN
        PRINT '⚠ product_attribute_values tablosu zaten mevcut.';
    END

    -- =============================================
    -- Step 4: products tablosuna brand kolonu ekle (eğer yoksa)
    -- =============================================
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.products') 
        AND name = 'brand'
    )
    BEGIN
        ALTER TABLE [dbo].[products]
        ADD [brand] NVARCHAR(100) NULL;

        PRINT '✓ products tablosuna brand kolonu eklendi.';
    END
    ELSE
    BEGIN
        PRINT '⚠ products tablosunda brand kolonu zaten mevcut.';
    END

    -- =============================================
    -- Step 5: Indexler oluştur
    -- =============================================
    
    -- product_attributes indexes
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_product_attributes_slug' 
        AND object_id = OBJECT_ID('dbo.product_attributes')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_product_attributes_slug]
        ON [dbo].[product_attributes] ([slug]);
        PRINT '✓ IX_product_attributes_slug index oluşturuldu.';
    END

    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_product_attributes_display_order' 
        AND object_id = OBJECT_ID('dbo.product_attributes')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_product_attributes_display_order]
        ON [dbo].[product_attributes] ([display_order]);
        PRINT '✓ IX_product_attributes_display_order index oluşturuldu.';
    END

    -- attribute_values indexes
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_attribute_values_attribute_id' 
        AND object_id = OBJECT_ID('dbo.attribute_values')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_attribute_values_attribute_id]
        ON [dbo].[attribute_values] ([attribute_id]);
        PRINT '✓ IX_attribute_values_attribute_id index oluşturuldu.';
    END

    -- product_attribute_values indexes
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_product_attribute_values_product_id' 
        AND object_id = OBJECT_ID('dbo.product_attribute_values')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_product_attribute_values_product_id]
        ON [dbo].[product_attribute_values] ([product_id]);
        PRINT '✓ IX_product_attribute_values_product_id index oluşturuldu.';
    END

    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_product_attribute_values_value_id' 
        AND object_id = OBJECT_ID('dbo.product_attribute_values')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_product_attribute_values_value_id]
        ON [dbo].[product_attribute_values] ([attribute_value_id]);
        PRINT '✓ IX_product_attribute_values_value_id index oluşturuldu.';
    END

    -- products.brand index
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_products_brand' 
        AND object_id = OBJECT_ID('dbo.products')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_products_brand]
        ON [dbo].[products] ([brand]);
        PRINT '✓ IX_products_brand index oluşturuldu.';
    END

    -- =============================================
    -- Step 6: Örnek özellikler ekle
    -- =============================================
    
    -- Renk özelliği
    IF NOT EXISTS (SELECT * FROM [dbo].[product_attributes] WHERE slug = 'renk')
    BEGIN
        INSERT INTO [dbo].[product_attributes] ([name], [slug], [type], [display_order])
        VALUES (N'Renk', 'renk', 'color', 1);
        PRINT '✓ Renk özelliği eklendi.';
    END

    -- Marka özelliği (attribute olarak değil, products.brand kullanılacak)
    -- Materyal özelliği
    IF NOT EXISTS (SELECT * FROM [dbo].[product_attributes] WHERE slug = 'materyal')
    BEGIN
        INSERT INTO [dbo].[product_attributes] ([name], [slug], [type], [display_order])
        VALUES (N'Materyal', 'materyal', 'text', 2);
        PRINT '✓ Materyal özelliği eklendi.';
    END

    -- Cinsiyet özelliği
    IF NOT EXISTS (SELECT * FROM [dbo].[product_attributes] WHERE slug = 'cinsiyet')
    BEGIN
        INSERT INTO [dbo].[product_attributes] ([name], [slug], [type], [display_order])
        VALUES (N'Cinsiyet', 'cinsiyet', 'text', 3);
        PRINT '✓ Cinsiyet özelliği eklendi.';
    END

    -- Beden özelliği
    IF NOT EXISTS (SELECT * FROM [dbo].[product_attributes] WHERE slug = 'beden')
    BEGIN
        INSERT INTO [dbo].[product_attributes] ([name], [slug], [type], [display_order])
        VALUES (N'Beden', 'beden', 'text', 4);
        PRINT '✓ Beden özelliği eklendi.';
    END

    COMMIT TRANSACTION;
    PRINT '';
    PRINT '=============================================';
    PRINT '✓ Ürün özellikleri sistemi başarıyla kuruldu!';
    PRINT '=============================================';
    PRINT '';

END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorNumber INT = ERROR_NUMBER();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();

    PRINT '';
    PRINT '=============================================';
    PRINT '✗ HATA OLUŞTU!';
    PRINT '=============================================';
    PRINT 'Hata Numarası: ' + CAST(@ErrorNumber AS VARCHAR(10));
    PRINT 'Hata Mesajı: ' + @ErrorMessage;
    PRINT '=============================================';
    PRINT '';

    THROW;
END CATCH;
GO

