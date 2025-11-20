// Fix order_status_history table - remove old status column and ensure new_status is NOT NULL
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load .env.local file
const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('❌ .env.local dosyası bulunamadı!');
  process.exit(1);
}

dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable bulunamadı!');
  process.exit(1);
}

import { executeNonQuery, closeConnection } from '../lib/db-setup';

async function fixOrderStatusHistoryColumns() {
  try {
    console.log('🔧 Fixing order_status_history table columns...\n');

    // Check if old 'status' column exists and fix it
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      BEGIN
        -- If old 'status' column exists, we need to handle it
        IF EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
          AND name = 'status'
        )
        BEGIN
          -- If new_status doesn't exist, create it and migrate
          IF NOT EXISTS (
            SELECT * FROM sys.columns 
            WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
            AND name = 'new_status'
          )
          BEGIN
            -- Add new_status column
            ALTER TABLE order_status_history
            ADD new_status NVARCHAR(50) NULL;
            
            -- Migrate data from status to new_status
            UPDATE order_status_history
            SET new_status = status
            WHERE new_status IS NULL AND status IS NOT NULL;
            
            -- Make new_status NOT NULL
            UPDATE order_status_history
            SET new_status = 'PENDING'
            WHERE new_status IS NULL;
            
            ALTER TABLE order_status_history
            ALTER COLUMN new_status NVARCHAR(50) NOT NULL;
            
            PRINT '✅ Created new_status and migrated data';
          END
          
          -- Now remove old status column (drop constraint first if exists)
          BEGIN TRY
            ALTER TABLE order_status_history
            DROP COLUMN status;
            PRINT '✅ Removed old status column';
          END TRY
          BEGIN CATCH
            PRINT '⚠️  Could not drop status column (may have dependencies)';
          END CATCH
        END
        
        -- Ensure new_status exists and is NOT NULL (only if it doesn't exist from above)
        IF NOT EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
          AND name = 'new_status'
        )
        BEGIN
          ALTER TABLE order_status_history
          ADD new_status NVARCHAR(50) NOT NULL DEFAULT 'PENDING';
          
          -- Remove default after setting values
          DECLARE @constraintName NVARCHAR(200);
          SELECT @constraintName = name 
          FROM sys.default_constraints 
          WHERE parent_object_id = OBJECT_ID('order_status_history') 
          AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('order_status_history'), 'new_status', 'ColumnId');
          
          IF @constraintName IS NOT NULL
          BEGIN
            EXEC('ALTER TABLE order_status_history DROP CONSTRAINT ' + @constraintName);
          END
          
          PRINT '✅ Created new_status column';
        END
        
        -- Ensure new_status is NOT NULL (if it exists)
        IF EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
          AND name = 'new_status'
        )
        BEGIN
          -- First, set any NULL values to a default
          UPDATE order_status_history
          SET new_status = 'PENDING'
          WHERE new_status IS NULL;
          
          BEGIN TRY
            ALTER TABLE order_status_history
            ALTER COLUMN new_status NVARCHAR(50) NOT NULL;
            PRINT '✅ Ensured new_status is NOT NULL';
          END TRY
          BEGIN CATCH
            PRINT '⚠️  Could not alter new_status (may have NULL values or already NOT NULL)';
          END CATCH
        END
        
        -- Ensure old_status can be NULL
        IF EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
          AND name = 'old_status'
        )
        BEGIN
          BEGIN TRY
            ALTER TABLE order_status_history
            ALTER COLUMN old_status NVARCHAR(50) NULL;
            PRINT '✅ Ensured old_status can be NULL';
          END TRY
          BEGIN CATCH
            PRINT '⚠️  Could not alter old_status';
          END CATCH
        END
      END
    `);

    console.log('✅ order_status_history table columns fixed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

fixOrderStatusHistoryColumns().catch(console.error);

