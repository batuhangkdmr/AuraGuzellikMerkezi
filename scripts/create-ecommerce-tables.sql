-- E-Commerce Database Tables
-- Run this script in SQL Server Management Studio

-- Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name NVARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE INDEX IX_users_email ON users(email);
    CREATE INDEX IX_users_role ON users(role);
    
    PRINT '✅ users table created';
END
ELSE
BEGIN
    PRINT 'ℹ️  users table already exists';
END
GO

-- Products table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'products')
BEGIN
    CREATE TABLE products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description NVARCHAR(MAX) NOT NULL,
        price DECIMAL(18,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        images NVARCHAR(MAX) NULL, -- JSON array as string: ["url1", "url2"]
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    
    CREATE INDEX IX_products_slug ON products(slug);
    CREATE INDEX IX_products_created_at ON products(created_at);
    
    PRINT '✅ products table created';
END
ELSE
BEGIN
    PRINT 'ℹ️  products table already exists';
END
GO

-- Cart items table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cart_items')
BEGIN
    CREATE TABLE cart_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NULL, -- NULL for guest users
        session_id VARCHAR(255) NULL, -- For guest users
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_cart_items_user_id ON cart_items(user_id);
    CREATE INDEX IX_cart_items_session_id ON cart_items(session_id);
    CREATE INDEX IX_cart_items_product_id ON cart_items(product_id);
    
    PRINT '✅ cart_items table created';
END
ELSE
BEGIN
    PRINT 'ℹ️  cart_items table already exists';
END
GO

-- Orders table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'orders')
BEGIN
    CREATE TABLE orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        total DECIMAL(18,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        shipping_address_json NVARCHAR(MAX) NOT NULL, -- JSON object
        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        confirmed_at DATETIME2 NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_orders_user_id ON orders(user_id);
    CREATE INDEX IX_orders_status ON orders(status);
    CREATE INDEX IX_orders_created_at ON orders(created_at);
    
    PRINT '✅ orders table created';
END
ELSE
BEGIN
    PRINT 'ℹ️  orders table already exists';
END
GO

-- Order items table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'order_items')
BEGIN
    CREATE TABLE order_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NULL, -- NULL if product is deleted
        name_snapshot NVARCHAR(255) NOT NULL,
        price_snapshot DECIMAL(18,2) NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IX_order_items_order_id ON order_items(order_id);
    CREATE INDEX IX_order_items_product_id ON order_items(product_id);
    
    PRINT '✅ order_items table created';
END
ELSE
BEGIN
    PRINT 'ℹ️  order_items table already exists';
END
GO

PRINT '';
PRINT '✅ All tables created successfully!';
PRINT '';


