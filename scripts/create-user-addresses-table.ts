// Create user_addresses table
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

async function createUserAddressesTable() {
  try {
    console.log('📋 Creating user_addresses table...\n');

    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_addresses')
      BEGIN
        CREATE TABLE user_addresses (
          id INT PRIMARY KEY IDENTITY(1,1),
          user_id INT NOT NULL,
          title NVARCHAR(100) NOT NULL,
          full_name NVARCHAR(255) NOT NULL,
          phone NVARCHAR(20) NOT NULL,
          address NVARCHAR(500) NOT NULL,
          city NVARCHAR(100) NOT NULL,
          postal_code NVARCHAR(20) NOT NULL,
          country NVARCHAR(100) NOT NULL DEFAULT 'Türkiye',
          is_default BIT NOT NULL DEFAULT 0,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT FK_user_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE INDEX IX_user_addresses_user_id ON user_addresses(user_id);
        CREATE INDEX IX_user_addresses_is_default ON user_addresses(is_default);
        
        PRINT '✅ user_addresses table created';
      END
      ELSE
      BEGIN
        PRINT 'ℹ️  user_addresses table already exists';
      END
    `);

    console.log('✅ user_addresses table created successfully!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

createUserAddressesTable().catch(console.error);

