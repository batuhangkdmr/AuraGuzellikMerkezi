-- =============================================
-- Category System - Database Migration
-- 3-level hierarchical category structure
-- Run this in SQL Server Management Studio (New Query)
-- =============================================

USE auraguzellikmerkezi2;
GO

PRINT '========================================';
PRINT 'Category System Migration Started';
PRINT '========================================';
PRINT '';

-- =============================================
-- Step 1: Create categories table
-- =============================================
PRINT 'Step 1: Creating categories table...';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    BEGIN TRY
        CREATE TABLE dbo.categories (
            id INT PRIMARY KEY IDENTITY(1,1),
            name NVARCHAR(200) NOT NULL,
            slug NVARCHAR(250) NOT NULL,
            parent_id INT NULL, -- NULL = main category, otherwise subcategory or childcategory
            image NVARCHAR(500) NULL, -- Cloudinary URL (optional)
            display_order INT NOT NULL DEFAULT 0, -- For sorting in menus
            is_active BIT NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME NOT NULL DEFAULT GETDATE()
        );
        
        PRINT 'Step 1a: SUCCESS - categories table created!';
        
        -- Add unique constraint for slug
        ALTER TABLE dbo.categories
        ADD CONSTRAINT UQ_categories_slug UNIQUE (slug);
        
        PRINT 'Step 1b: SUCCESS - Unique constraint on slug added!';
        
        -- Add foreign key for parent category (self-referential)
        ALTER TABLE dbo.categories
        ADD CONSTRAINT FK_categories_parent 
            FOREIGN KEY (parent_id) REFERENCES dbo.categories(id) ON DELETE CASCADE;
        
        PRINT 'Step 1c: SUCCESS - Foreign key constraint added!';
        
        -- Create indexes for better performance
        -- Note: slug already has an index from UNIQUE constraint, so we don't create another one
        CREATE INDEX IX_categories_parent_id ON dbo.categories(parent_id);
        CREATE INDEX IX_categories_is_active ON dbo.categories(is_active);
        CREATE INDEX IX_categories_display_order ON dbo.categories(display_order);
        
        PRINT 'Step 1d: SUCCESS - Indexes created successfully!';
        PRINT '   Note: slug column already has an index from UNIQUE constraint.';
        PRINT 'Step 1: COMPLETED - categories table is ready!';
    END TRY
    BEGIN CATCH
        PRINT 'Step 1: ERROR - ' + ERROR_MESSAGE();
        PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10));
        PRINT 'Error State: ' + CAST(ERROR_STATE() AS VARCHAR(10));
    END CATCH
END
ELSE
BEGIN
    PRINT 'Step 1: categories table already exists.';
END
GO

-- =============================================
-- Step 2: Create product_categories table (many-to-many)
-- =============================================
PRINT '';
PRINT 'Step 2: Creating product_categories table...';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'product_categories' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    BEGIN TRY
        CREATE TABLE dbo.product_categories (
            id INT PRIMARY KEY IDENTITY(1,1),
            product_id INT NOT NULL,
            category_id INT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT GETDATE()
        );
        
        PRINT 'Step 2a: SUCCESS - product_categories table created!';
        
        -- Add foreign key for product
        ALTER TABLE dbo.product_categories
        ADD CONSTRAINT FK_product_categories_product 
            FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE;
        
        PRINT 'Step 2b: SUCCESS - Foreign key for product added!';
        
        -- Add foreign key for category (will be added after categories table exists)
        -- Check if categories table exists first
        IF EXISTS (SELECT * FROM sys.tables WHERE name = 'categories' AND schema_id = SCHEMA_ID('dbo'))
        BEGIN
            ALTER TABLE dbo.product_categories
            ADD CONSTRAINT FK_product_categories_category 
                FOREIGN KEY (category_id) REFERENCES dbo.categories(id) ON DELETE CASCADE;
            
            PRINT 'Step 2c: SUCCESS - Foreign key for category added!';
        END
        ELSE
        BEGIN
            PRINT 'Step 2c: WARNING - categories table does not exist yet. Please run Step 1 first.';
        END
        
        -- Add unique constraint: a product can only be in a category once
        ALTER TABLE dbo.product_categories
        ADD CONSTRAINT UQ_product_categories_product_category 
            UNIQUE (product_id, category_id);
        
        PRINT 'Step 2d: SUCCESS - Unique constraint added!';
        
        -- Create indexes for better performance
        CREATE INDEX IX_product_categories_product_id ON dbo.product_categories(product_id);
        CREATE INDEX IX_product_categories_category_id ON dbo.product_categories(category_id);
        
        PRINT 'Step 2e: SUCCESS - Indexes created successfully!';
        PRINT 'Step 2: COMPLETED - product_categories table is ready!';
    END TRY
    BEGIN CATCH
        PRINT 'Step 2: ERROR - ' + ERROR_MESSAGE();
        PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10));
        PRINT 'Error State: ' + CAST(ERROR_STATE() AS VARCHAR(10));
    END CATCH
END
ELSE
BEGIN
    PRINT 'Step 2: product_categories table already exists.';
END
GO

-- =============================================
-- Step 3: Add primary_category_id column to products table (optional, for primary category)
-- =============================================
PRINT '';
PRINT 'Step 3: Adding primary_category_id to products table...';

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'products' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.products') 
        AND name = 'primary_category_id'
    )
    BEGIN
        BEGIN TRY
            ALTER TABLE dbo.products
            ADD primary_category_id INT NULL;
            
            PRINT 'Step 3a: SUCCESS - primary_category_id column added!';
            
            -- Check if categories table exists before adding foreign key
            IF EXISTS (SELECT * FROM sys.tables WHERE name = 'categories' AND schema_id = SCHEMA_ID('dbo'))
            BEGIN
                -- Foreign key for primary category
                ALTER TABLE dbo.products
                ADD CONSTRAINT FK_products_primary_category 
                    FOREIGN KEY (primary_category_id) REFERENCES dbo.categories(id) ON DELETE SET NULL;
                
                PRINT 'Step 3b: SUCCESS - Foreign key constraint added!';
            END
            ELSE
            BEGIN
                PRINT 'Step 3b: WARNING - categories table does not exist yet. Foreign key will be added after categories table is created.';
            END
            
            -- Index for primary category
            CREATE INDEX IX_products_primary_category_id ON dbo.products(primary_category_id);
            
            PRINT 'Step 3c: SUCCESS - Index created!';
            PRINT 'Step 3: COMPLETED - primary_category_id column is ready!';
        END TRY
        BEGIN CATCH
            PRINT 'Step 3: ERROR - ' + ERROR_MESSAGE();
            PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR(10));
            PRINT 'Error State: ' + CAST(ERROR_STATE() AS VARCHAR(10));
        END CATCH
    END
    ELSE
    BEGIN
        PRINT 'Step 3: primary_category_id column already exists.';
    END
END
ELSE
BEGIN
    PRINT 'Step 3: ERROR - products table does not exist!';
    PRINT 'Please create products table first.';
END
GO

-- =============================================
-- Step 4: Verification
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Migration Verification';
PRINT '========================================';
PRINT '';

-- Check categories table
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'categories' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT '✅ categories table: EXISTS';
    
    BEGIN TRY
        DECLARE @CategoryCount INT;
        SELECT @CategoryCount = COUNT(*) FROM dbo.categories;
        PRINT '   Total Categories: ' + CAST(@CategoryCount AS VARCHAR(10));
        
        DECLARE @MainCategoryCount INT;
        SELECT @MainCategoryCount = COUNT(*) FROM dbo.categories WHERE parent_id IS NULL;
        PRINT '   Main Categories: ' + CAST(@MainCategoryCount AS VARCHAR(10));
    END TRY
    BEGIN CATCH
        PRINT '   Could not count categories: ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT '❌ categories table: MISSING';
END

-- Check product_categories table
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'product_categories' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    PRINT '✅ product_categories table: EXISTS';
    
    BEGIN TRY
        DECLARE @ProductCategoryCount INT;
        SELECT @ProductCategoryCount = COUNT(*) FROM dbo.product_categories;
        PRINT '   Product-Category relationships: ' + CAST(@ProductCategoryCount AS VARCHAR(10));
    END TRY
    BEGIN CATCH
        PRINT '   Could not count relationships: ' + ERROR_MESSAGE();
    END CATCH
END
ELSE
BEGIN
    PRINT '❌ product_categories table: MISSING';
END

-- Check primary_category_id column
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'products' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    IF EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.products') 
        AND name = 'primary_category_id'
    )
    BEGIN
        PRINT '✅ primary_category_id column: EXISTS';
    END
    ELSE
    BEGIN
        PRINT '⚠️  primary_category_id column: MISSING (optional)';
    END
END
ELSE
BEGIN
    PRINT '⚠️  products table: NOT FOUND (primary_category_id check skipped)';
END

PRINT '';
PRINT '========================================';
PRINT 'Migration Summary';
PRINT '========================================';
PRINT '';

-- Final summary
DECLARE @TablesCreated INT = 0;
DECLARE @ColumnsAdded INT = 0;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'categories' AND schema_id = SCHEMA_ID('dbo'))
    SET @TablesCreated = @TablesCreated + 1;

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'product_categories' AND schema_id = SCHEMA_ID('dbo'))
    SET @TablesCreated = @TablesCreated + 1;

IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.products') 
    AND name = 'primary_category_id'
)
    SET @ColumnsAdded = 1;

IF @TablesCreated = 2 AND @ColumnsAdded = 1
BEGIN
    PRINT '✅ Migration completed successfully!';
    PRINT '';
    PRINT 'All tables and columns are ready:';
    PRINT '  - categories table: ✅';
    PRINT '  - product_categories table: ✅';
    PRINT '  - primary_category_id column: ✅';
    PRINT '';
    PRINT 'Next steps:';
    PRINT '1. Test the category system in the application';
    PRINT '2. Create categories via admin panel';
    PRINT '3. Assign categories to products';
END
ELSE
BEGIN
    PRINT '⚠️  Migration completed with warnings:';
    PRINT '  - Tables created: ' + CAST(@TablesCreated AS VARCHAR(10)) + '/2';
    PRINT '  - Columns added: ' + CAST(@ColumnsAdded AS VARCHAR(10)) + '/1';
    PRINT '';
    PRINT 'Please review the error messages above.';
END

PRINT '';
PRINT '========================================';
GO

