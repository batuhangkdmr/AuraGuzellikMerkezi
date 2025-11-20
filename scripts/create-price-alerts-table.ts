// Create price alerts table
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

async function createPriceAlertsTable() {
  try {
    console.log('📋 Creating price_alerts table...\n');

    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'price_alerts')
      BEGIN
        CREATE TABLE price_alerts (
          id INT PRIMARY KEY IDENTITY(1,1),
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          target_price DECIMAL(10,2) NULL, -- If null, alert on any price drop
          current_price DECIMAL(10,2) NOT NULL,
          is_active BIT NOT NULL DEFAULT 1,
          notified_at DATETIME2 NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          
          CONSTRAINT FK_price_alerts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT FK_price_alerts_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          CONSTRAINT UQ_price_alerts_user_product UNIQUE (user_id, product_id)
        );

        CREATE INDEX IX_price_alerts_user_id ON price_alerts(user_id);
        CREATE INDEX IX_price_alerts_product_id ON price_alerts(product_id);
        CREATE INDEX IX_price_alerts_is_active ON price_alerts(is_active);
        
        PRINT 'Price alerts table created successfully';
      END
      ELSE
      BEGIN
        PRINT 'Price alerts table already exists';
      END
    `);

    console.log('✅ Price alerts table created successfully');
  } catch (error) {
    console.error('❌ Error creating price alerts table:', error);
    throw error;
  }
}

// Run the script
createPriceAlertsTable()
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

