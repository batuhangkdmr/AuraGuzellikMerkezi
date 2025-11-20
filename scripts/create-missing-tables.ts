// Create missing tables (categories, attributes, favorites, etc.)
import dotenv from 'dotenv';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

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

import { executeNonQuery, getConnection, closeConnection } from '../lib/db-setup';

async function createMissingTables() {
  try {
    console.log('📦 Eksik tablolar oluşturuluyor...\n');
    
    await getConnection();
    
    // 1. Categories table
    console.log('📋 Creating categories table...');
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'categories')
      BEGIN
        CREATE TABLE categories (
          id INT PRIMARY KEY IDENTITY(1,1),
          name NVARCHAR(200) NOT NULL,
          slug NVARCHAR(250) NOT NULL UNIQUE,
          parent_id INT NULL,
          image NVARCHAR(500) NULL,
          display_order INT NOT NULL DEFAULT 0,
          is_active BIT NOT NULL DEFAULT 1,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT FK_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE NO ACTION
        );
        CREATE INDEX IX_categories_parent_id ON categories(parent_id);
        CREATE INDEX IX_categories_slug ON categories(slug);
        CREATE INDEX IX_categories_is_active ON categories(is_active);
        PRINT '✅ categories table created';
      END
    `);
    console.log('   ✅ categories table');
    
    // 2. Product categories (many-to-many)
    console.log('📋 Creating product_categories table...');
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'product_categories')
      BEGIN
        CREATE TABLE product_categories (
          product_id INT NOT NULL,
          category_id INT NOT NULL,
          PRIMARY KEY (product_id, category_id),
          CONSTRAINT FK_product_categories_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          CONSTRAINT FK_product_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );
        CREATE INDEX IX_product_categories_product_id ON product_categories(product_id);
        CREATE INDEX IX_product_categories_category_id ON product_categories(category_id);
        PRINT '✅ product_categories table created';
      END
    `);
    console.log('   ✅ product_categories table');
    
    // 3. Add missing columns to products table
    console.log('📋 Adding missing columns to products table...');
    try {
      await executeNonQuery(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'is_active')
        BEGIN
          ALTER TABLE products ADD is_active BIT NOT NULL DEFAULT 1;
          CREATE INDEX IX_products_is_active ON products(is_active);
        END
      `);
      console.log('   ✅ is_active column');
    } catch (e: any) {
      if (!e.message?.includes('already exists')) console.log('   ℹ️  is_active column already exists');
    }
    
    try {
      await executeNonQuery(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'primary_category_id')
        BEGIN
          ALTER TABLE products ADD primary_category_id INT NULL;
          ALTER TABLE products ADD CONSTRAINT FK_products_primary_category FOREIGN KEY (primary_category_id) REFERENCES categories(id);
        END
      `);
      console.log('   ✅ primary_category_id column');
    } catch (e: any) {
      if (!e.message?.includes('already exists')) console.log('   ℹ️  primary_category_id column already exists');
    }
    
    try {
      await executeNonQuery(`
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('products') AND name = 'brand')
        BEGIN
          ALTER TABLE products ADD brand NVARCHAR(100) NULL;
        END
      `);
      console.log('   ✅ brand column');
    } catch (e: any) {
      if (!e.message?.includes('already exists')) console.log('   ℹ️  brand column already exists');
    }
    
    // 4. Product attributes
    console.log('📋 Creating product_attributes table...');
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'product_attributes')
      BEGIN
        CREATE TABLE product_attributes (
          id INT PRIMARY KEY IDENTITY(1,1),
          name NVARCHAR(100) NOT NULL,
          slug NVARCHAR(100) NOT NULL UNIQUE,
          type NVARCHAR(20) NOT NULL DEFAULT 'text',
          display_order INT NOT NULL DEFAULT 0,
          is_active BIT NOT NULL DEFAULT 1,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
        );
        CREATE INDEX IX_product_attributes_slug ON product_attributes(slug);
        CREATE INDEX IX_product_attributes_is_active ON product_attributes(is_active);
        PRINT '✅ product_attributes table created';
      END
    `);
    console.log('   ✅ product_attributes table');
    
    // 5. Attribute values
    console.log('📋 Creating attribute_values table...');
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'attribute_values')
      BEGIN
        CREATE TABLE attribute_values (
          id INT PRIMARY KEY IDENTITY(1,1),
          attribute_id INT NOT NULL,
          value NVARCHAR(200) NOT NULL,
          slug NVARCHAR(200) NOT NULL,
          color_code VARCHAR(7) NULL,
          display_order INT NOT NULL DEFAULT 0,
          is_active BIT NOT NULL DEFAULT 1,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT FK_attribute_values_attribute FOREIGN KEY (attribute_id) REFERENCES product_attributes(id) ON DELETE CASCADE
        );
        CREATE INDEX IX_attribute_values_attribute_id ON attribute_values(attribute_id);
        CREATE INDEX IX_attribute_values_slug ON attribute_values(slug);
        PRINT '✅ attribute_values table created';
      END
    `);
    console.log('   ✅ attribute_values table');
    
    // 6. Product attribute values (many-to-many)
    console.log('📋 Creating product_attribute_values table...');
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'product_attribute_values')
      BEGIN
        CREATE TABLE product_attribute_values (
          product_id INT NOT NULL,
          attribute_value_id INT NOT NULL,
          PRIMARY KEY (product_id, attribute_value_id),
          CONSTRAINT FK_product_attribute_values_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          CONSTRAINT FK_product_attribute_values_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE
        );
        CREATE INDEX IX_product_attribute_values_product_id ON product_attribute_values(product_id);
        CREATE INDEX IX_product_attribute_values_value_id ON product_attribute_values(attribute_value_id);
        PRINT '✅ product_attribute_values table created';
      END
    `);
    console.log('   ✅ product_attribute_values table');
    
    // 7. Favorites
    console.log('📋 Creating favorites table...');
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'favorites')
      BEGIN
        CREATE TABLE favorites (
          id INT PRIMARY KEY IDENTITY(1,1),
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT FK_favorites_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT FK_favorites_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          CONSTRAINT UQ_favorites_user_product UNIQUE (user_id, product_id)
        );
        CREATE INDEX IX_favorites_user_id ON favorites(user_id);
        CREATE INDEX IX_favorites_product_id ON favorites(product_id);
        PRINT '✅ favorites table created';
      END
    `);
    console.log('   ✅ favorites table');
    
    // 8. Order status history
    console.log('📋 Creating/updating order_status_history table...');
    
    // Create table if it doesn't exist
    await executeNonQuery(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      BEGIN
        CREATE TABLE order_status_history (
          id INT PRIMARY KEY IDENTITY(1,1),
          order_id INT NOT NULL,
          admin_user_id INT NULL,
          old_status NVARCHAR(50) NULL,
          new_status NVARCHAR(50) NOT NULL,
          note NVARCHAR(500) NULL,
          created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
          CONSTRAINT FK_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          CONSTRAINT FK_order_status_history_admin_user FOREIGN KEY (admin_user_id) REFERENCES users(id)
        );
        CREATE INDEX IX_order_status_history_order_id ON order_status_history(order_id);
        CREATE INDEX IX_order_status_history_admin_user_id ON order_status_history(admin_user_id);
        CREATE INDEX IX_order_status_history_created_at ON order_status_history(created_at);
        PRINT '✅ order_status_history table created';
      END
    `);
    
    // Add missing columns if table exists - split into separate queries
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      BEGIN
        -- Add admin_user_id if missing
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'admin_user_id')
        BEGIN
          ALTER TABLE order_status_history ADD admin_user_id INT NULL;
          PRINT '✅ admin_user_id column added';
        END
      END
    `);
    
    // Add foreign key separately
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'admin_user_id')
      AND NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_order_status_history_admin_user')
      BEGIN
        ALTER TABLE order_status_history ADD CONSTRAINT FK_order_status_history_admin_user FOREIGN KEY (admin_user_id) REFERENCES users(id);
        PRINT '✅ Foreign key for admin_user_id added';
      END
    `);
    
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      BEGIN
        -- Add old_status if missing
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'old_status')
        BEGIN
          ALTER TABLE order_status_history ADD old_status NVARCHAR(50) NULL;
          PRINT '✅ old_status column added';
        END
        
        -- Add new_status if missing
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'new_status')
        BEGIN
          ALTER TABLE order_status_history ADD new_status NVARCHAR(50) NULL;
          PRINT '✅ new_status column added';
        END
      END
    `);
    
    // Migrate data from status to new_status
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'status')
      AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'new_status')
      BEGIN
        UPDATE order_status_history SET new_status = status WHERE new_status IS NULL AND status IS NOT NULL;
        PRINT '✅ Migrated status data to new_status';
      END
    `);
    
    await executeNonQuery(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'order_status_history')
      BEGIN
        -- Rename notes to note if needed
        IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'notes')
        AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'note')
        BEGIN
          EXEC sp_rename 'order_status_history.notes', 'note', 'COLUMN';
          PRINT '✅ notes column renamed to note';
        END
        
        -- Add note if missing
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'note')
        AND NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.order_status_history') AND name = 'notes')
        BEGIN
          ALTER TABLE order_status_history ADD note NVARCHAR(500) NULL;
          PRINT '✅ note column added';
        END
      END
    `);
    console.log('   ✅ order_status_history table');
    
    console.log('\n✅ Tüm eksik tablolar oluşturuldu!');
    console.log('💡 Tabloları kontrol etmek için: npm run check-tables');
    
  } catch (error: any) {
    console.error('❌ Hata:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

createMissingTables().catch(console.error);

