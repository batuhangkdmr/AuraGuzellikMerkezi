-- Manual fix for order_status_history table
-- Run this in SQL Server Management Studio

-- Step 1: Check current columns
SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'order_status_history'
ORDER BY ORDINAL_POSITION;

-- Step 2: If old 'status' column exists, drop it
IF EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID('order_status_history') 
  AND name = 'status'
)
BEGIN
  ALTER TABLE order_status_history DROP COLUMN status;
  PRINT '✅ Dropped old status column';
END
ELSE
BEGIN
  PRINT 'ℹ️  status column does not exist';
END

-- Step 3: Ensure new_status exists
IF NOT EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID('order_status_history') 
  AND name = 'new_status'
)
BEGIN
  ALTER TABLE order_status_history
  ADD new_status NVARCHAR(50) NOT NULL DEFAULT 'PENDING';
  PRINT '✅ Added new_status column';
END
ELSE
BEGIN
  PRINT 'ℹ️  new_status column already exists';
END

-- Step 4: Fix any NULL values in new_status
UPDATE order_status_history
SET new_status = 'PENDING'
WHERE new_status IS NULL;

-- Step 5: Ensure new_status is NOT NULL
IF EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID('order_status_history') 
  AND name = 'new_status'
  AND is_nullable = 'YES'
)
BEGIN
  ALTER TABLE order_status_history
  ALTER COLUMN new_status NVARCHAR(50) NOT NULL;
  PRINT '✅ Made new_status NOT NULL';
END
ELSE
BEGIN
  PRINT 'ℹ️  new_status is already NOT NULL';
END

-- Step 6: Ensure old_status can be NULL
IF EXISTS (
  SELECT * FROM sys.columns 
  WHERE object_id = OBJECT_ID('order_status_history') 
  AND name = 'old_status'
  AND is_nullable = 'NO'
)
BEGIN
  ALTER TABLE order_status_history
  ALTER COLUMN old_status NVARCHAR(50) NULL;
  PRINT '✅ Made old_status nullable';
END
ELSE
BEGIN
  PRINT 'ℹ️  old_status is already nullable';
END

-- Final check
SELECT COLUMN_NAME, IS_NULLABLE, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'order_status_history'
ORDER BY ORDINAL_POSITION;

