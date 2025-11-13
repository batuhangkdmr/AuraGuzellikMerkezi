-- =============================================
-- Favoriler Sistemi Tablosu
-- =============================================
-- Bu script, kullanıcıların ürünleri favorilere ekleyebilmesi için
-- favorites tablosunu oluşturur.
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
    -- Step 1: favorites tablosunu oluştur
    -- =============================================
    IF NOT EXISTS (
        SELECT * FROM sys.tables 
        WHERE name = 'favorites' AND type = 'U'
    )
    BEGIN
        CREATE TABLE [dbo].[favorites] (
            [id] INT IDENTITY(1,1) NOT NULL,
            [user_id] INT NOT NULL,
            [product_id] INT NOT NULL,
            [created_at] DATETIME NOT NULL DEFAULT GETDATE(),
            
            CONSTRAINT [PK_favorites] PRIMARY KEY CLUSTERED ([id] ASC),
            CONSTRAINT [FK_favorites_user] FOREIGN KEY ([user_id])
                REFERENCES [dbo].[users] ([id])
                ON DELETE CASCADE,
            CONSTRAINT [FK_favorites_product] FOREIGN KEY ([product_id])
                REFERENCES [dbo].[products] ([id])
                ON DELETE CASCADE,
            CONSTRAINT [UQ_favorites_user_product] UNIQUE ([user_id], [product_id])
        );

        PRINT '✓ favorites tablosu oluşturuldu.';
    END
    ELSE
    BEGIN
        PRINT '⚠ favorites tablosu zaten mevcut.';
    END

    -- =============================================
    -- Step 2: Indexler oluştur
    -- =============================================
    
    -- user_id için index
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_favorites_user_id' 
        AND object_id = OBJECT_ID('dbo.favorites')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_favorites_user_id]
        ON [dbo].[favorites] ([user_id]);
        PRINT '✓ IX_favorites_user_id index oluşturuldu.';
    END

    -- product_id için index
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_favorites_product_id' 
        AND object_id = OBJECT_ID('dbo.favorites')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_favorites_product_id]
        ON [dbo].[favorites] ([product_id]);
        PRINT '✓ IX_favorites_product_id index oluşturuldu.';
    END

    -- created_at için index (sıralama için)
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE name = 'IX_favorites_created_at' 
        AND object_id = OBJECT_ID('dbo.favorites')
    )
    BEGIN
        CREATE NONCLUSTERED INDEX [IX_favorites_created_at]
        ON [dbo].[favorites] ([created_at] DESC);
        PRINT '✓ IX_favorites_created_at index oluşturuldu.';
    END

    COMMIT TRANSACTION;
    PRINT '';
    PRINT '=============================================';
    PRINT '✓ Favoriler sistemi başarıyla kuruldu!';
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

