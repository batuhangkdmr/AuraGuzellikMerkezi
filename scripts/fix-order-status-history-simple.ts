// Simple fix: Remove old status column if exists, ensure new_status is NOT NULL
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

async function fixOrderStatusHistorySimple() {
  try {
    console.log('🔧 Fixing order_status_history table (simple approach)...\n');

    // Step 1: If old 'status' column exists, try to drop it
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      AND EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'status'
      )
      BEGIN
        BEGIN TRY
          ALTER TABLE order_status_history DROP COLUMN status;
          PRINT '✅ Dropped old status column';
        END TRY
        BEGIN CATCH
          PRINT '⚠️  Could not drop status column: ' + ERROR_MESSAGE();
        END CATCH
      END
    `);

    // Step 2: Ensure new_status exists
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      AND NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'new_status'
      )
      BEGIN
        ALTER TABLE order_status_history
        ADD new_status NVARCHAR(50) NOT NULL DEFAULT 'PENDING';
        PRINT '✅ Added new_status column';
      END
    `);

    // Step 3: Ensure new_status is NOT NULL and has no NULL values
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      AND EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'new_status'
      )
      BEGIN
        -- Set any NULL values to PENDING
        UPDATE order_status_history
        SET new_status = 'PENDING'
        WHERE new_status IS NULL;
        
        -- Try to make it NOT NULL
        BEGIN TRY
          ALTER TABLE order_status_history
          ALTER COLUMN new_status NVARCHAR(50) NOT NULL;
          PRINT '✅ Ensured new_status is NOT NULL';
        END TRY
        BEGIN CATCH
          PRINT '⚠️  Could not make new_status NOT NULL: ' + ERROR_MESSAGE();
        END CATCH
      END
    `);

    // Step 4: Ensure old_status can be NULL
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      AND EXISTS (
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
          PRINT '⚠️  Could not alter old_status: ' + ERROR_MESSAGE();
        END CATCH
      END
    `);

    console.log('✅ Fix completed!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

fixOrderStatusHistorySimple().catch(console.error);

