// Create order_returns table
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

async function createReturnsTable() {
  try {
    console.log('📋 Creating order_returns table...\n');

    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_returns')
      BEGIN
        CREATE TABLE order_returns (
          id INT PRIMARY KEY IDENTITY(1,1),
          order_id INT NOT NULL,
          user_id INT NOT NULL,
          reason NVARCHAR(500) NOT NULL,
          status NVARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED')),
          admin_note NVARCHAR(1000) NULL,
          refund_amount DECIMAL(18,2) NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          processed_at DATETIME2 NULL,
          CONSTRAINT FK_order_returns_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE NO ACTION,
          CONSTRAINT FK_order_returns_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE INDEX IX_order_returns_order_id ON order_returns(order_id);
        CREATE INDEX IX_order_returns_user_id ON order_returns(user_id);
        CREATE INDEX IX_order_returns_status ON order_returns(status);
        
        PRINT '✅ order_returns table created';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  order_returns table already exists';
      END
    `);

    // Create return_items table
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'return_items')
      BEGIN
        CREATE TABLE return_items (
          id INT PRIMARY KEY IDENTITY(1,1),
          return_id INT NOT NULL,
          order_item_id INT NOT NULL,
          quantity INT NOT NULL,
          reason NVARCHAR(500) NULL,
          CONSTRAINT FK_return_items_return FOREIGN KEY (return_id) REFERENCES order_returns(id) ON DELETE CASCADE,
          CONSTRAINT FK_return_items_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE NO ACTION
        );
        
        CREATE INDEX IX_return_items_return_id ON return_items(return_id);
        CREATE INDEX IX_return_items_order_item_id ON return_items(order_item_id);
        
        PRINT '✅ return_items table created';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  order_returns table already exists';
      END
    `);

    console.log('✅ Returns tables created successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

createReturnsTable().catch(console.error);

