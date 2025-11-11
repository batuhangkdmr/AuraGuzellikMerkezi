-- Add is_active column to products table
-- Run this script in SQL Server Management Studio

USE auraguzellikmerkezi2;
GO

-- Add is_active column if it doesn't exist
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'products') 
    AND name = 'is_active'
)
BEGIN
    ALTER TABLE products
    ADD is_active BIT NOT NULL DEFAULT 1;
    
    -- Set existing products with stock > 0 as active
    UPDATE products
    SET is_active = 1
    WHERE stock > 0;
    
    -- Set existing products with stock = 0 as inactive
    UPDATE products
    SET is_active = 0
    WHERE stock = 0;
    
    -- Create index for better query performance
    CREATE INDEX IX_products_is_active ON products(is_active);
    CREATE INDEX IX_products_is_active_stock ON products(is_active, stock);
    
    PRINT '✅ is_active column added to products table';
END
ELSE
BEGIN
    PRINT 'ℹ️  is_active column already exists';
END
GO

PRINT '';
PRINT '✅ Migration completed successfully!';
PRINT '';

