-- =============================================
-- Order Management System - Database Migration
-- Run this in SQL Server Management Studio (New Query)
-- =============================================

USE auraguzellikmerkezi2;
GO

-- =============================================
-- Step 1: Add tracking_number column to orders table
-- =============================================
PRINT 'Step 1: Adding tracking_number column to orders table...';

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.orders') 
    AND name = 'tracking_number'
)
BEGIN
    ALTER TABLE dbo.orders
    ADD tracking_number NVARCHAR(100) NULL;
    
    PRINT 'Step 1: SUCCESS - tracking_number column added!';
END
ELSE
BEGIN
    PRINT 'Step 1: tracking_number column already exists.';
END
GO

-- =============================================
-- Step 2: Create order_status_history table
-- =============================================
PRINT '';
PRINT 'Step 2: Creating order_status_history table...';

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
BEGIN
    CREATE TABLE dbo.order_status_history (
        id INT PRIMARY KEY IDENTITY(1,1),
        order_id INT NOT NULL,
        admin_user_id INT NOT NULL,
        old_status NVARCHAR(50) NULL,
        new_status NVARCHAR(50) NOT NULL,
        note NVARCHAR(500) NULL,
        created_at DATETIME NOT NULL DEFAULT GETDATE(),
        
        -- Foreign keys
        CONSTRAINT FK_order_status_history_order 
            FOREIGN KEY (order_id) REFERENCES dbo.orders(id) ON DELETE CASCADE,
        CONSTRAINT FK_order_status_history_admin_user 
            FOREIGN KEY (admin_user_id) REFERENCES dbo.users(id)
    );
    
    PRINT 'Step 2: SUCCESS - order_status_history table created!';
    
    -- Create indexes for better query performance
    CREATE INDEX IX_order_status_history_order_id ON dbo.order_status_history(order_id);
    CREATE INDEX IX_order_status_history_admin_user_id ON dbo.order_status_history(admin_user_id);
    CREATE INDEX IX_order_status_history_created_at ON dbo.order_status_history(created_at);
    
    PRINT 'Step 2: Indexes created successfully!';
END
ELSE
BEGIN
    PRINT 'Step 2: order_status_history table already exists.';
END
GO

-- =============================================
-- Step 3: Create index for tracking_number (if column exists)
-- =============================================
PRINT '';
PRINT 'Step 3: Creating index for tracking_number...';

IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.orders') 
    AND name = 'tracking_number'
)
BEGIN
    IF NOT EXISTS (
        SELECT * FROM sys.indexes 
        WHERE object_id = OBJECT_ID(N'dbo.orders') 
        AND name = 'IX_orders_tracking_number'
    )
    BEGIN
        CREATE INDEX IX_orders_tracking_number ON dbo.orders(tracking_number)
        WHERE tracking_number IS NOT NULL; -- Filtered index for non-null values
        
        PRINT 'Step 3: SUCCESS - Index IX_orders_tracking_number created!';
    END
    ELSE
    BEGIN
        PRINT 'Step 3: Index IX_orders_tracking_number already exists.';
    END
END
ELSE
BEGIN
    PRINT 'Step 3: SKIPPED - tracking_number column does not exist.';
END
GO

-- =============================================
-- Step 4: Verify migration
-- =============================================
PRINT '';
PRINT '========================================';
PRINT 'Migration Verification';
PRINT '========================================';
PRINT '';

-- Check tracking_number column
IF EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.orders') 
    AND name = 'tracking_number'
)
BEGIN
    PRINT '✅ tracking_number column: EXISTS';
END
ELSE
BEGIN
    PRINT '❌ tracking_number column: MISSING';
END

-- Check order_status_history table
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
BEGIN
    PRINT '✅ order_status_history table: EXISTS';
    
    -- Count columns
    DECLARE @ColumnCount INT;
    SELECT @ColumnCount = COUNT(*) 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.order_status_history');
    PRINT '   Columns: ' + CAST(@ColumnCount AS VARCHAR(10));
END
ELSE
BEGIN
    PRINT '❌ order_status_history table: MISSING';
END

-- Check indexes
IF EXISTS (
    SELECT * FROM sys.indexes 
    WHERE object_id = OBJECT_ID(N'dbo.orders') 
    AND name = 'IX_orders_tracking_number'
)
BEGIN
    PRINT '✅ IX_orders_tracking_number index: EXISTS';
END
ELSE
BEGIN
    PRINT '⚠️  IX_orders_tracking_number index: MISSING (optional)';
END

IF EXISTS (
    SELECT * FROM sys.indexes 
    WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
    AND name = 'IX_order_status_history_order_id'
)
BEGIN
    PRINT '✅ IX_order_status_history_order_id index: EXISTS';
END
ELSE
BEGIN
    PRINT '⚠️  IX_order_status_history_order_id index: MISSING';
END

PRINT '';
PRINT '========================================';
PRINT 'Migration completed!';
PRINT '========================================';
PRINT '';
PRINT 'Next steps:';
PRINT '1. Verify the tables and columns in SQL Server Management Studio';
PRINT '2. Test the application with the new order management features';
PRINT '';
GO

