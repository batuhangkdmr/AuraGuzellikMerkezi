// Create product_reviews table
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

async function createProductReviewsTable() {
  try {
    console.log('📋 Creating product_reviews table...\n');

    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'product_reviews')
      BEGIN
        CREATE TABLE product_reviews (
          id INT PRIMARY KEY IDENTITY(1,1),
          product_id INT NOT NULL,
          user_id INT NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment NVARCHAR(1000) NULL,
          is_approved BIT NOT NULL DEFAULT 0,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT FK_product_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          CONSTRAINT FK_product_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT UQ_product_reviews_user_product UNIQUE (product_id, user_id)
        );
        
        CREATE INDEX IX_product_reviews_product_id ON product_reviews(product_id);
        CREATE INDEX IX_product_reviews_user_id ON product_reviews(user_id);
        CREATE INDEX IX_product_reviews_is_approved ON product_reviews(is_approved);
        CREATE INDEX IX_product_reviews_rating ON product_reviews(rating);
        
        PRINT '✅ product_reviews table created';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  product_reviews table already exists';
      END
    `);

    console.log('✅ product_reviews table created successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

createProductReviewsTable().catch(console.error);

