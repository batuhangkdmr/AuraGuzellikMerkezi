-- Add is_active column to products table
-- Run this script in SQL Server Management Studio (New Query)

USE auraguzellikmerkezi2;
GO

-- Check if column exists, if not add it
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.products') 
    AND name = 'is_active'
)
BEGIN
    PRINT 'Adding is_active column to products table...';
    
    -- Add is_active column
    ALTER TABLE products
    ADD is_active BIT NOT NULL DEFAULT 1;
    
    PRINT '✅ is_active column added successfully!';
    
    -- Update existing products: set active if stock > 0, inactive if stock = 0
    UPDATE products
    SET is_active = CASE WHEN stock > 0 THEN 1 ELSE 0 END;
    
    PRINT '✅ Updated existing products based on stock levels.';
    
    -- Create indexes for better query performance
    CREATE INDEX IX_products_is_active ON products(is_active);
    CREATE INDEX IX_products_is_active_stock ON products(is_active, stock);
    
    PRINT '✅ Indexes created successfully!';
END
ELSE
BEGIN
    PRINT 'ℹ️  is_active column already exists in products table.';
END
GO

PRINT '';
PRINT '✅ Migration completed!';
PRINT 'All products with stock > 0 are now active.';
PRINT 'All products with stock = 0 are now inactive.';
PRINT '';

