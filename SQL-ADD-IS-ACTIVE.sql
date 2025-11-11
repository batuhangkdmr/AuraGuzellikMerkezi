-- =============================================
-- Add is_active column to products table
-- Run this in SQL Server Management Studio (New Query)
-- =============================================

USE auraguzellikmerkezi2;
GO

-- Step 1: Check if column exists and add it
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'products') 
    AND name = 'is_active'
)
BEGIN
    PRINT 'Step 1: Adding is_active column to products table...';
    
    BEGIN TRY
        -- Add is_active column with default value
        ALTER TABLE products
        ADD is_active BIT NOT NULL DEFAULT 1;
        
        PRINT 'Step 1: SUCCESS - is_active column added successfully!';
    END TRY
    BEGIN CATCH
        PRINT 'Step 1: ERROR - ' + ERROR_MESSAGE();
        PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10));
        PRINT 'Error State: ' + CAST(ERROR_STATE() AS VARCHAR(10));
    END CATCH
END
ELSE
BEGIN
    PRINT 'Step 1: is_active column already exists.';
END
GO

-- Step 2: Verify column exists and update existing products
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'products') 
    AND name = 'is_active'
)
BEGIN
    PRINT 'Step 2: Updating existing products based on stock levels...';
    
    BEGIN TRY
        -- Update existing products: set active if stock > 0, inactive if stock = 0
        UPDATE products
        SET is_active = CASE WHEN stock > 0 THEN 1 ELSE 0 END;
        
        PRINT 'Step 2: SUCCESS - Updated ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' products.';
    END TRY
    BEGIN CATCH
        PRINT 'Step 2: ERROR - ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT 'Step 2: ERROR - is_active column does not exist! Cannot update products.';
    PRINT 'Please check Step 1 error messages above.';
END
GO

-- Step 3: Create indexes (if they don't exist)
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'products') 
    AND name = 'is_active'
)
BEGIN
    PRINT 'Step 3: Creating indexes...';
    
    -- Create index for is_active
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE object_id = OBJECT_ID(N'products') 
        AND name = 'IX_products_is_active'
    )
    BEGIN
        BEGIN TRY
            CREATE INDEX IX_products_is_active ON products(is_active);
            PRINT 'Step 3a: SUCCESS - Index IX_products_is_active created!';
        END TRY
        BEGIN CATCH
            PRINT 'Step 3a: ERROR - ' + ERROR_MESSAGE();
        END CATCH
    END
    ELSE
    BEGIN
        PRINT 'Step 3a: Index IX_products_is_active already exists.';
    END
    
    -- Create composite index for is_active and stock
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE object_id = OBJECT_ID(N'products') 
        AND name = 'IX_products_is_active_stock'
    )
    BEGIN
        BEGIN TRY
            CREATE INDEX IX_products_is_active_stock ON products(is_active, stock);
            PRINT 'Step 3b: SUCCESS - Index IX_products_is_active_stock created!';
        END TRY
        BEGIN CATCH
            PRINT 'Step 3b: ERROR - ' + ERROR_MESSAGE();
        END CATCH
    END
    ELSE
    BEGIN
        PRINT 'Step 3b: Index IX_products_is_active_stock already exists.';
    END
END
ELSE
BEGIN
    PRINT 'Step 3: ERROR - is_active column does not exist! Cannot create indexes.';
END
GO

-- Step 4: Final verification
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'products') 
    AND name = 'is_active'
)
BEGIN
    PRINT '';
    PRINT '========================================';
    PRINT 'Migration completed successfully!';
    PRINT '========================================';
    PRINT '';
    PRINT 'Summary:';
    PRINT '- is_active column: EXISTS';
    
    BEGIN TRY
        -- Count active and inactive products
        DECLARE @ActiveCount INT;
        DECLARE @InactiveCount INT;
        
        SELECT @ActiveCount = COUNT(*) FROM products WHERE is_active = 1;
        SELECT @InactiveCount = COUNT(*) FROM products WHERE is_active = 0;
        
        PRINT '- Active products (is_active = 1): ' + CAST(@ActiveCount AS VARCHAR(10));
        PRINT '- Inactive products (is_active = 0): ' + CAST(@InactiveCount AS VARCHAR(10));
        PRINT '';
        PRINT 'All products with stock > 0 are now active.';
        PRINT 'All products with stock = 0 are now inactive.';
        PRINT '';
    END TRY
    BEGIN CATCH
        PRINT 'ERROR counting products: ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT '';
    PRINT '========================================';
    PRINT 'ERROR: Migration failed!';
    PRINT '========================================';
    PRINT '';
    PRINT 'The is_active column was not created successfully.';
    PRINT 'Please check the error messages above and try again.';
    PRINT '';
    PRINT 'You can try running the SQL-TEST-IS-ACTIVE.sql script';
    PRINT 'to diagnose the problem.';
    PRINT '';
END
GO
