// Fix order_status_history table structure
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

async function fixOrderStatusHistory() {
  try {
    console.log('🔧 Fixing order_status_history table...\n');

    // Check current columns
    console.log('📋 Checking current table structure...');
    
    // Add missing columns if they don't exist
    console.log('   Adding missing columns...');
    
    // Check and add admin_user_id column
    await executeNonQuery(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'admin_user_id'
      )
      BEGIN
        ALTER TABLE order_status_history
        ADD admin_user_id INT NULL;
        PRINT '✅ admin_user_id column added';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  admin_user_id column already exists';
      END
    `);

    // Check and add old_status column
    await executeNonQuery(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'old_status'
      )
      BEGIN
        ALTER TABLE order_status_history
        ADD old_status NVARCHAR(50) NULL;
        PRINT '✅ old_status column added';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  old_status column already exists';
      END
    `);

    // Check and add new_status column
    await executeNonQuery(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'new_status'
      )
      BEGIN
        ALTER TABLE order_status_history
        ADD new_status NVARCHAR(50) NULL;
        PRINT '✅ new_status column added';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  new_status column already exists';
      END
    `);

    // Check if 'note' column exists, if not check for 'notes' and rename it
    await executeNonQuery(`
      IF NOT EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'note'
      )
      BEGIN
        -- If 'notes' exists, rename it to 'note'
        IF EXISTS (
          SELECT * FROM sys.columns 
          WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
          AND name = 'notes'
        )
        BEGIN
          EXEC sp_rename 'order_status_history.notes', 'note', 'COLUMN';
          PRINT '✅ Renamed notes column to note';
        END
        ELSE
        BEGIN
          -- Add 'note' column if neither exists
          ALTER TABLE order_status_history
          ADD note NVARCHAR(500) NULL;
          PRINT '✅ note column added';
        END
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  note column already exists';
      END
    `);

    // If status column exists but new_status doesn't, we need to migrate data
    await executeNonQuery(`
      IF EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'status'
      )
      AND EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'new_status'
      )
      BEGIN
        -- Copy status to new_status if new_status is NULL
        UPDATE order_status_history
        SET new_status = status
        WHERE new_status IS NULL AND status IS NOT NULL;
        PRINT '✅ Migrated status data to new_status';
      END
    `);

    // Add foreign key for admin_user_id if it doesn't exist
    await executeNonQuery(`
      IF NOT EXISTS (
        SELECT * FROM sys.foreign_keys 
        WHERE name = 'FK_order_status_history_admin_user'
      )
      AND EXISTS (
        SELECT * FROM sys.columns 
        WHERE object_id = OBJECT_ID(N'dbo.order_status_history') 
        AND name = 'admin_user_id'
      )
      BEGIN
        ALTER TABLE order_status_history
        ADD CONSTRAINT FK_order_status_history_admin_user 
        FOREIGN KEY (admin_user_id) REFERENCES users(id);
        PRINT '✅ Foreign key for admin_user_id added';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  Foreign key for admin_user_id already exists or column missing';
      END
    `);

    console.log('\n✅ order_status_history table fixed successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

fixOrderStatusHistory().catch(console.error);

