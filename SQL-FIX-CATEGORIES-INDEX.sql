-- =============================================
-- Fix Categories Table - Remove duplicate index on slug
-- Run this if you got Error 1750 in Step 1
-- =============================================

USE auraguzellikmerkezi2;
GO

PRINT '========================================';
PRINT 'Fixing Categories Table Indexes';
PRINT '========================================';
PRINT '';

-- Check if IX_categories_slug index exists and remove it
-- (slug already has an index from UNIQUE constraint)
IF EXISTS (
    SELECT * FROM sys.indexes 
    WHERE object_id = OBJECT_ID(N'dbo.categories') 
    AND name = 'IX_categories_slug'
)
BEGIN
    BEGIN TRY
        DROP INDEX IX_categories_slug ON dbo.categories;
        PRINT '✅ SUCCESS - Duplicate index IX_categories_slug removed!';
        PRINT '   Note: slug column already has an index from UNIQUE constraint (UQ_categories_slug).';
    END TRY
    BEGIN CATCH
        PRINT '❌ ERROR - Could not remove index: ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT 'ℹ️  INFO - IX_categories_slug index does not exist (already removed or never created).';
END
GO

-- Verify indexes on categories table
PRINT '';
PRINT '========================================';
PRINT 'Current Indexes on categories table:';
PRINT '========================================';

SELECT 
    i.name AS IndexName,
    i.type_desc AS IndexType,
    i.is_unique AS IsUnique,
    STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS ColumnNames
FROM sys.indexes i
INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
WHERE i.object_id = OBJECT_ID(N'dbo.categories')
    AND i.name IS NOT NULL
GROUP BY i.name, i.type_desc, i.is_unique
ORDER BY i.name;

PRINT '';
PRINT '========================================';
PRINT 'Fix completed!';
PRINT '========================================';
GO

