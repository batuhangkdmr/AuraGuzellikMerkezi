// Create notifications table
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

/**
 * Create notifications table for both admin and user notifications
 */
async function createNotificationsTable() {
  try {
    console.log('Creating notifications table...');

    // Create notifications table
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.notifications') AND type in (N'U'))
      BEGIN
        CREATE TABLE notifications (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL,
          type NVARCHAR(50) NOT NULL, -- 'ORDER', 'STOCK', 'CAMPAIGN', 'PRICE', 'REVIEW', 'RETURN', 'SYSTEM'
          title NVARCHAR(255) NOT NULL,
          message NVARCHAR(MAX) NOT NULL,
          data_json NVARCHAR(MAX) NULL, -- JSON data for additional info (order_id, product_id, etc.)
          is_read BIT NOT NULL DEFAULT 0,
          read_at DATETIME2 NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          
          CONSTRAINT FK_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        -- Indexes for better performance
        CREATE INDEX IX_notifications_user_id ON notifications(user_id);
        CREATE INDEX IX_notifications_is_read ON notifications(is_read);
        CREATE INDEX IX_notifications_created_at ON notifications(created_at);
        CREATE INDEX IX_notifications_type ON notifications(type);
        
        PRINT 'Notifications table created successfully';
      END
      ELSE
      BEGIN
        PRINT 'Notifications table already exists';
      END
    `);

    console.log('✅ Notifications table created successfully');
  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    throw error;
  }
}

// Run the script
createNotificationsTable()
  .then(async () => {
    await closeConnection();
    console.log('Script completed');
    process.exit(0);
  })
  .catch(async (error) => {
    await closeConnection();
    console.error('Script failed:', error);
    process.exit(1);
  });

