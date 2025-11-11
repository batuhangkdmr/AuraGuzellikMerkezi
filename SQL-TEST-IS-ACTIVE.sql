-- =============================================
-- TEST: Check if is_active column exists and try to add it
-- Run this FIRST to diagnose the problem
-- =============================================

USE auraguzellikmerkezi2;
GO

-- Check current table structure
PRINT '=== Checking products table structure ===';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'products'
ORDER BY ORDINAL_POSITION;
GO

-- Check if is_active column exists
PRINT '';
PRINT '=== Checking if is_active column exists ===';
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'products') 
    AND name = 'is_active'
)
BEGIN
    PRINT 'is_active column EXISTS in products table.';
END
ELSE
BEGIN
    PRINT 'is_active column DOES NOT EXIST in products table.';
    PRINT 'Attempting to add it...';
    
    -- Try to add the column
    ALTER TABLE products
    ADD is_active BIT NOT NULL DEFAULT 1;
    
    PRINT 'Column added successfully!';
END
GO

-- Verify again
PRINT '';
PRINT '=== Final verification ===';
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'products') 
    AND name = 'is_active'
)
BEGIN
    PRINT 'SUCCESS: is_active column now EXISTS!';
    
    -- Show the column details
    SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'products'
    AND COLUMN_NAME = 'is_active';
END
ELSE
BEGIN
    PRINT 'ERROR: is_active column still DOES NOT EXIST!';
END
GO

