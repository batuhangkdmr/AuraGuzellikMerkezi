-- =============================================
-- SIMPLE: Add is_active column to products table
-- Run this in SQL Server Management Studio (New Query)
-- =============================================

USE auraguzellikmerkezi2;
GO

-- Simply add the column (if it doesn't exist, this will fail gracefully in some cases)
-- But we'll use a try-catch approach with IF NOT EXISTS

-- Method 1: Direct ALTER TABLE (simplest)
BEGIN TRY
    ALTER TABLE dbo.products
    ADD is_active BIT NOT NULL DEFAULT 1;
    PRINT 'SUCCESS: is_active column added!';
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 2705  -- Column already exists
    BEGIN
        PRINT 'INFO: is_active column already exists.';
    END
    ELSE
    BEGIN
        PRINT 'ERROR: ' + ERROR_MESSAGE();
        PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10));
    END
END CATCH
GO

-- Verify column exists
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.products') 
    AND name = 'is_active'
)
BEGIN
    PRINT 'Verification: is_active column EXISTS.';
    
    -- Update products
    UPDATE dbo.products
    SET is_active = CASE WHEN stock > 0 THEN 1 ELSE 0 END;
    
    PRINT 'Updated products based on stock levels.';
    
    -- Create indexes (if they don't exist)
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.products') AND name = 'IX_products_is_active')
    BEGIN
        CREATE INDEX IX_products_is_active ON dbo.products(is_active);
        PRINT 'Index IX_products_is_active created.';
    END
    
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'dbo.products') AND name = 'IX_products_is_active_stock')
    BEGIN
        CREATE INDEX IX_products_is_active_stock ON dbo.products(is_active, stock);
        PRINT 'Index IX_products_is_active_stock created.';
    END
    
    PRINT '';
    PRINT 'Migration completed successfully!';
END
ELSE
BEGIN
    PRINT 'ERROR: is_active column was NOT created!';
    PRINT 'Please check the error messages above.';
END
GO

