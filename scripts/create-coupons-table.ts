// Create coupons table
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

async function createCouponsTable() {
  try {
    console.log('📋 Creating coupons table...\n');

    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'coupons')
      BEGIN
        CREATE TABLE coupons (
          id INT PRIMARY KEY IDENTITY(1,1),
          code NVARCHAR(50) NOT NULL UNIQUE,
          description NVARCHAR(500) NULL,
          discount_type NVARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
          discount_value DECIMAL(10,2) NOT NULL,
          min_purchase_amount DECIMAL(18,2) NULL,
          max_discount_amount DECIMAL(18,2) NULL,
          usage_limit INT NULL,
          used_count INT NOT NULL DEFAULT 0,
          is_active BIT NOT NULL DEFAULT 1,
          valid_from DATETIME2 NOT NULL DEFAULT GETDATE(),
          valid_until DATETIME2 NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
        );
        
        CREATE INDEX IX_coupons_code ON coupons(code);
        CREATE INDEX IX_coupons_is_active ON coupons(is_active);
        CREATE INDEX IX_coupons_valid_from ON coupons(valid_from);
        CREATE INDEX IX_coupons_valid_until ON coupons(valid_until);
        
        PRINT '✅ coupons table created';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  coupons table already exists';
      END
    `);

    // Create coupon_usage table to track which users used which coupons
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'coupon_usage')
      BEGIN
        CREATE TABLE coupon_usage (
          id INT PRIMARY KEY IDENTITY(1,1),
          coupon_id INT NOT NULL,
          user_id INT NOT NULL,
          order_id INT NULL,
          used_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT FK_coupon_usage_coupon FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
          CONSTRAINT FK_coupon_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT FK_coupon_usage_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE NO ACTION
        );
        
        CREATE INDEX IX_coupon_usage_coupon_id ON coupon_usage(coupon_id);
        CREATE INDEX IX_coupon_usage_user_id ON coupon_usage(user_id);
        CREATE INDEX IX_coupon_usage_order_id ON coupon_usage(order_id);
        
        PRINT '✅ coupon_usage table created';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  coupon_usage table already exists';
      END
    `);

    console.log('✅ Coupons tables created successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

createCouponsTable().catch(console.error);

