// Database Setup Script
// This script creates all tables
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Load .env.local file FIRST, before any other imports
const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('❌ .env.local dosyası bulunamadı!');
  console.error(`   Beklenen konum: ${envPath}`);
  console.error('   Lütfen .env.local dosyasını oluşturun ve DATABASE_URL değişkenini ekleyin.');
  process.exit(1);
}

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ .env.local dosyası yüklenirken hata:', result.error);
  process.exit(1);
}

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable bulunamadı!');
  console.error('   .env.local dosyasında DATABASE_URL değişkeninin olduğundan emin olun.');
  process.exit(1);
}

console.log('✅ .env.local dosyası yüklendi');
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL.substring(0, 50)}...`);

// Use db-setup.ts instead of db.ts to avoid server-only import
import { executeNonQuery, executeQueryOne, getConnection, closeConnection } from '../lib/db-setup';

async function createTables() {
  console.log('📦 Creating database tables...');

  // Check if table exists helper
  const tableExists = async (tableName: string): Promise<boolean> => {
    try {
      const result = await executeQueryOne<{ count: number }>(`
        SELECT COUNT(*) as count
        FROM sys.tables
        WHERE name = '${tableName}'
      `);
      return result ? result.count > 0 : false;
    } catch (error) {
      console.warn(`Warning: Could not check if table ${tableName} exists:`, error);
      return false;
    }
  };

  // Users table
  try {
    const exists = await tableExists('users');
    console.log(`   Checking users table exists: ${exists}`);
    if (!exists) {
      console.log('   Creating users table...');
      await executeNonQuery(`
        CREATE TABLE users (
          id INT IDENTITY(1,1) PRIMARY KEY,
          email NVARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          name NVARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'USER',
          created_at DATETIME2 NOT NULL DEFAULT GETDATE()
        )
      `);
      console.log('   Users table created, creating indexes...');
      await executeNonQuery(`CREATE INDEX IX_users_email ON users(email)`);
      await executeNonQuery(`CREATE INDEX IX_users_role ON users(role)`);
      console.log('✅ users table created');
    } else {
      console.log('ℹ️  users table already exists');
    }
  } catch (error: any) {
    console.error('❌ Error creating users table:', error);
    throw error;
  }

  // Products table
  try {
    if (!(await tableExists('products'))) {
      await executeNonQuery(`
        CREATE TABLE products (
          id INT IDENTITY(1,1) PRIMARY KEY,
          name NVARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description NVARCHAR(MAX) NOT NULL,
          price DECIMAL(18,2) NOT NULL,
          stock INT NOT NULL DEFAULT 0,
          images NVARCHAR(MAX) NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
        )
      `);
      await executeNonQuery(`CREATE INDEX IX_products_slug ON products(slug)`);
      await executeNonQuery(`CREATE INDEX IX_products_created_at ON products(created_at)`);
      console.log('✅ products table created');
    } else {
      console.log('ℹ️  products table already exists');
    }
  } catch (error: any) {
    console.error('❌ Error creating products table:', error.message);
    throw error;
  }

  // Cart items table
  try {
    if (!(await tableExists('cart_items'))) {
      await executeNonQuery(`
        CREATE TABLE cart_items (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NULL,
          session_id VARCHAR(255) NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `);
      await executeNonQuery(`CREATE INDEX IX_cart_items_user_id ON cart_items(user_id)`);
      await executeNonQuery(`CREATE INDEX IX_cart_items_session_id ON cart_items(session_id)`);
      await executeNonQuery(`CREATE INDEX IX_cart_items_product_id ON cart_items(product_id)`);
      console.log('✅ cart_items table created');
    } else {
      console.log('ℹ️  cart_items table already exists');
    }
  } catch (error: any) {
    console.error('❌ Error creating cart_items table:', error.message);
    throw error;
  }

  // Orders table
  try {
    if (!(await tableExists('orders'))) {
      await executeNonQuery(`
        CREATE TABLE orders (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT NOT NULL,
          total DECIMAL(18,2) NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
          shipping_address_json NVARCHAR(MAX) NOT NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          confirmed_at DATETIME2 NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      await executeNonQuery(`CREATE INDEX IX_orders_user_id ON orders(user_id)`);
      await executeNonQuery(`CREATE INDEX IX_orders_status ON orders(status)`);
      await executeNonQuery(`CREATE INDEX IX_orders_created_at ON orders(created_at)`);
      console.log('✅ orders table created');
    } else {
      console.log('ℹ️  orders table already exists');
    }
  } catch (error: any) {
    console.error('❌ Error creating orders table:', error.message);
    throw error;
  }

  // Order items table
  try {
    if (!(await tableExists('order_items'))) {
      await executeNonQuery(`
        CREATE TABLE order_items (
          id INT IDENTITY(1,1) PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NULL,
          name_snapshot NVARCHAR(255) NOT NULL,
          price_snapshot DECIMAL(18,2) NOT NULL,
          quantity INT NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        )
      `);
      await executeNonQuery(`CREATE INDEX IX_order_items_order_id ON order_items(order_id)`);
      await executeNonQuery(`CREATE INDEX IX_order_items_product_id ON order_items(product_id)`);
      console.log('✅ order_items table created');
    } else {
      console.log('ℹ️  order_items table already exists');
    }
  } catch (error: any) {
    console.error('❌ Error creating order_items table:', error.message);
    throw error;
  }

  console.log('\n✅ All tables created successfully!');
}


async function createDatabase() {
  console.log('📦 Creating database if not exists...');
  
  // Parse database name from DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || '';
  let dbName = 'auraguzellikmerkezi2';
  
  // Extract database name from connection string
  if (dbUrl.includes('Initial Catalog=')) {
    const match = dbUrl.match(/Initial Catalog=([^;]+)/i);
    if (match) {
      dbName = match[1].trim();
    }
  } else if (dbUrl.includes('Database=')) {
    const match = dbUrl.match(/Database=([^;]+)/i);
    if (match) {
      dbName = match[1].trim();
    }
  }
  
  // Connect to master database first
  const originalUrl = process.env.DATABASE_URL;
  const masterUrl = dbUrl
    .replace(/Initial Catalog=[^;]+/i, 'Initial Catalog=master')
    .replace(/Database=[^;]+/i, 'Database=master');
  
  process.env.DATABASE_URL = masterUrl;
  
  // Clear connection pool to force reconnection
  await closeConnection();
  
  try {
    const connection = await getConnection();
    
    // Check if database exists
    const dbExists = await executeQueryOne<{ exists: number }>(`
      SELECT COUNT(*) as [exists] 
      FROM sys.databases 
      WHERE name = '${dbName.replace(/'/g, "''")}'
    `);
    
    if (dbExists && dbExists.exists === 0) {
      // Create database
      await executeNonQuery(`CREATE DATABASE [${dbName}]`);
      console.log(`✅ Database '${dbName}' created`);
    } else {
      console.log(`ℹ️  Database '${dbName}' already exists`);
    }
    
    await closeConnection();
  } finally {
    // Restore original DATABASE_URL
    process.env.DATABASE_URL = originalUrl;
  }
}

async function main() {
  try {
    console.log('🚀 Starting database setup...\n');
    
    // Create database if not exists
    await createDatabase();
    console.log('');
    
    // Test connection to target database
    await getConnection();
    console.log('✅ Database connection successful\n');

    // Create tables
    await createTables();
    console.log('');

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await closeConnection();
  }
}

// Run if executed directly
main().catch(console.error);

export { createTables };

