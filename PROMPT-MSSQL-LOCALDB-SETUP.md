# Next.js + MSSQL LocalDB Bağlantı Kurulumu - Detaylı Prompt

## Senaryo
Next.js (App Router) projesinde MSSQL LocalDB'ye bağlanmak ve veritabanı/tablo oluşturmak istiyorum. C# ASP.NET Core projelerimde kullandığım connection string formatını kullanmak istiyorum.

## Adım 1: Gerekli Paketleri Kur

```bash
npm install mssql msnodesqlv8
npm install -D @types/mssql tsx dotenv
```

## Adım 2: .env.local Dosyasını Oluştur

Proje root'unda `.env.local` dosyası oluştur:

```env
DATABASE_URL="Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=PROJE_ADI;Integrated Security=True;"
```

**Not:** `PROJE_ADI` kısmını kendi veritabanı adınızla değiştirin.

## Adım 3: lib/db.ts Dosyasını Oluştur

`lib/db.ts` dosyasını oluştur ve aşağıdaki kodu yapıştır:

```typescript
// SQL Server Connection - Supports both LocalDB (via msnodesqlv8) and regular SQL Server (via tedious)
// LocalDB requires msnodesqlv8 for Named Pipes support
import type * as SqlTypes from 'mssql';
let sql: any;
let usingMsnodesqlv8 = false;

// Parse DATABASE_URL from environment
// Supports ASP.NET Core format: Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=dbname;Integrated Security=True;
function parseDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Check if it's ASP.NET Core connection string format
  if (dbUrl.includes('Data Source=') || dbUrl.includes('Initial Catalog=')) {
    const parts = dbUrl.split(';').filter(p => p.trim());
    const config: any = {
      server: 'localhost',
      database: '',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    };

    for (const part of parts) {
      const [key, ...valueParts] = part.split('=');
      const value = valueParts.join('=').trim();
      const keyLower = key.trim().toLowerCase();

      if (keyLower === 'data source' || keyLower === 'server') {
        const serverValue = value.trim();
        
        // Check if port is specified (e.g., "localhost,1433")
        if (serverValue.includes(',') && !serverValue.includes('\\')) {
          const [server, port] = serverValue.split(',');
          config.server = server.trim();
          config.port = parseInt(port.trim(), 10);
        } else if (serverValue.startsWith('(localdb)')) {
          // LocalDB format
          const backslashIndex = serverValue.indexOf('\\');
          if (backslashIndex !== -1) {
            config.server = 'localhost';
            config.options.instanceName = serverValue.substring(backslashIndex + 1);
          } else {
            config.server = 'localhost';
            config.options.instanceName = 'MSSQLLocalDB';
          }
        } else if (serverValue.includes('\\')) {
          // Named instance (e.g., "localhost\MSSQLSERVER01")
          const parts = serverValue.split('\\');
          if (parts.length === 2) {
            config.server = parts[0] === 'localhost' ? 'localhost' : parts[0];
            config.options.instanceName = parts[1];
            config.port = undefined;
          } else {
            config.server = serverValue;
          }
        } else {
          config.server = serverValue;
        }
      } else if (keyLower === 'initial catalog' || keyLower === 'database') {
        config.database = value;
      } else if (keyLower === 'integrated security') {
        config.options.trustedConnection = value.toLowerCase() === 'true';
      } else if (keyLower === 'user id' || keyLower === 'uid') {
        config.user = value;
      } else if (keyLower === 'password' || keyLower === 'pwd') {
        config.password = value;
      } else if (keyLower === 'encrypt') {
        config.options.encrypt = value.toLowerCase() === 'true';
      } else if (keyLower === 'trust server certificate') {
        config.options.trustServerCertificate = value.toLowerCase() === 'true';
      }
    }

    return config;
  }

  // Parse standard mssql:// format
  try {
    const url = new URL(dbUrl);
    const encrypt = url.searchParams.get('encrypt') === 'true';
    const trustServerCert = url.searchParams.get('trustServerCertificate') === 'true';
    const host = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 1433;
    const database = url.pathname.replace(/^\//, '');
    
    return {
      server: host,
      port,
      database,
      user: url.username || undefined,
      password: url.password || undefined,
      options: {
        encrypt,
        trustServerCertificate: trustServerCert,
        enableArithAbort: true,
      },
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL format: ${dbUrl}`);
  }
}

// Lazy load config - only parse when needed
let sqlConfig: any = null;

function getSqlConfig(): any {
  if (sqlConfig) {
    return sqlConfig;
  }

  const dbConfig = parseDatabaseUrl();

  // Check if this is LocalDB
  const isLocalDB = dbConfig.options?.instanceName === 'MSSQLLocalDB' || 
                    (dbConfig.server === 'localhost' && dbConfig.options?.instanceName === 'MSSQLLocalDB');
  
  // For LocalDB, use msnodesqlv8 driver (supports Named Pipes)
  if (isLocalDB) {
    // Try to load msnodesqlv8 for LocalDB
    try {
      sql = require('mssql/msnodesqlv8');
      usingMsnodesqlv8 = true;
      
      // Get LocalDB pipe name dynamically
      const { execSync } = require('child_process');
      let pipeName: string | null = null;
      
      try {
        const output = execSync('sqllocaldb info MSSQLLocalDB', { encoding: 'utf-8' });
        // Parse pipe name from output (format: "Instance pipe name: np:\\.\pipe\LOCALDB#XXXXX\tsql\query")
        const pipeMatch = output.match(/Instance pipe name:\s*(.+)/i);
        if (pipeMatch) {
          pipeName = pipeMatch[1].trim();
        }
      } catch (error) {
        console.warn('Could not get LocalDB pipe name, using default connection string');
      }
      
      // For msnodesqlv8, use connectionString format with ODBC Driver
      const odbcDrivers = [
        'ODBC Driver 17 for SQL Server',
        'ODBC Driver 13 for SQL Server',
        'SQL Server Native Client 11.0',
        'SQL Server'
      ];
      
      let connectionString = '';
      if (pipeName) {
        // Use pipe name directly
        connectionString = `Driver={${odbcDrivers[0]}};Server=${pipeName};Database=${dbConfig.database};Trusted_Connection=Yes;`;
      } else {
        // Use LocalDB instance name
        connectionString = `Driver={${odbcDrivers[0]}};Server=(localdb)\\MSSQLLocalDB;Database=${dbConfig.database};Trusted_Connection=Yes;`;
      }
      
      sqlConfig = {
        connectionString,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      } as any;
      
      return sqlConfig;
    } catch (error) {
      console.error('Failed to load msnodesqlv8 driver for LocalDB:', error);
      throw new Error('LocalDB connection requires msnodesqlv8 driver. Please install it: npm install msnodesqlv8');
    }
  }
  
  // For regular SQL Server, use tedious driver
  if (!sql) {
    sql = require('mssql');
  }
  
  // Check if this is a named instance (contains backslash) but not LocalDB
  const isNamedInstance = (dbConfig.server.includes('\\') || dbConfig.options?.instanceName) && 
                          dbConfig.options?.instanceName !== 'MSSQLLocalDB';
  
  // For named instances, we need to find the TCP/IP port
  if (isNamedInstance) {
    const { execSync } = require('child_process');
    let tcpPort: number | null = null;
    
    try {
      if (dbConfig.options?.instanceName === 'SQLEXPRESS' || dbConfig.server.includes('SQLEXPRESS')) {
        tcpPort = 1433;
      }
    } catch (error) {
      console.warn('Could not determine TCP port for named instance');
    }

    sqlConfig = {
      server: dbConfig.server.includes('\\') ? dbConfig.server.split('\\')[0] : dbConfig.server,
      database: dbConfig.database,
      options: {
        instanceName: dbConfig.options?.instanceName || (dbConfig.server.includes('\\') ? dbConfig.server.split('\\')[1] : undefined),
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };
    
    if (tcpPort) {
      sqlConfig.port = tcpPort;
    } else {
      sqlConfig.port = undefined;
    }
  } else {
    // Create mssql config for regular SQL Server
    sqlConfig = {
      server: dbConfig.server,
      database: dbConfig.database,
      options: {
        encrypt: dbConfig.options?.encrypt || false,
        trustServerCertificate: dbConfig.options?.trustServerCertificate ?? true,
        enableArithAbort: true,
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    // Add instance name if present (for named instances)
    if (dbConfig.options?.instanceName && sqlConfig.options) {
      sqlConfig.options.instanceName = dbConfig.options.instanceName;
      sqlConfig.port = undefined;
    } else if (dbConfig.port) {
      sqlConfig.port = dbConfig.port;
    } else {
      sqlConfig.port = 1433;
    }

    // Add authentication
    if (sqlConfig.options) {
      if (dbConfig.options?.trustedConnection) {
        sqlConfig.options.trustedConnection = true;
      } else if (dbConfig.user && dbConfig.password) {
        sqlConfig.user = dbConfig.user;
        sqlConfig.password = dbConfig.password;
        sqlConfig.options.trustedConnection = false;
      } else {
        sqlConfig.options.trustedConnection = true;
      }
    }

    if (dbConfig.port && !dbConfig.options?.instanceName) {
      sqlConfig.port = dbConfig.port;
    }
  }

  if (!sqlConfig) {
    throw new Error('Failed to create SQL config');
  }

  return sqlConfig;
}

// Connection Pool (singleton)
let pool: any = null;

export async function getConnection(): Promise<any> {
  if (!pool) {
    try {
      const config = getSqlConfig();
      pool = await sql.connect(config);
      console.log('✅ SQL Server bağlantısı başarılı!');
    } catch (error) {
      console.error('❌ SQL Server bağlantı hatası:', error);
      throw error;
    }
  }
  
  // Check if pool is still connected
  try {
    if (pool && !pool.connected) {
      await pool.connect();
    }
  } catch (error) {
    console.warn('Connection lost, reconnecting...');
    pool = null;
    return getConnection();
  }
  
  return pool!;
}

// Close connection pool
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('✅ SQL Server bağlantısı kapatıldı');
  }
}

// Execute query and return results
export async function executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
  try {
    const connection = await getConnection();
    const request = connection.request();
    
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }
    
    const result = await request.query(query);
    return result.recordset as T[];
  } catch (error) {
    console.error('SQL Query Error:', error);
    throw error;
  }
}

// Execute query and return first result
export async function executeQueryOne<T = any>(query: string, params?: Record<string, any>): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
}

// Execute non-query (INSERT, UPDATE, DELETE, etc.)
export async function executeNonQuery(query: string, params?: Record<string, any>): Promise<number> {
  try {
    const connection = await getConnection();
    const request = connection.request();
    
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }
    
    const result = await request.query(query);
    return result.rowsAffected[0] || 0;
  } catch (error) {
    console.error('SQL NonQuery Error:', error);
    throw error;
  }
}

// Execute transaction
export async function executeTransaction<T>(
  callback: (transaction: any) => Promise<T>
): Promise<T> {
  const connection = await getConnection();
  const transaction = new sql.Transaction(connection);
  
  try {
    await transaction.begin();
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

## Adım 4: setup-database.ts Script'ini Oluştur

`scripts/setup-database.ts` dosyasını oluştur:

```typescript
// Database Setup Script
// This script creates database and all tables
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

// Now import modules that depend on DATABASE_URL
import { executeNonQuery, executeQueryOne, getConnection, closeConnection } from '../lib/db';

async function createDatabase() {
  console.log('📦 Creating database if not exists...');
  
  // Parse database name from DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || '';
  let dbName = 'my_database'; // Default database name
  
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

async function createTables() {
  console.log('📦 Creating database tables...');

  // ÖRNEK: Users table
  await executeNonQuery(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
    BEGIN
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        name NVARCHAR(255) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
      );
      
      CREATE INDEX IX_users_email ON users(email);
      
      PRINT '✅ users table created';
    END
    ELSE
    BEGIN
      PRINT 'ℹ️  users table already exists';
    END
  `);

  // Buraya kendi tablolarınızı ekleyin
  // ÖRNEK: Products table
  await executeNonQuery(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'products')
    BEGIN
      CREATE TABLE products (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        price DECIMAL(18,2) NOT NULL,
        created_at DATETIME2 NOT NULL DEFAULT GETDATE()
      );
      
      PRINT '✅ products table created';
    END
    ELSE
    BEGIN
      PRINT 'ℹ️  products table already exists';
    END
  `);

  console.log('✅ All tables created successfully!');
}

async function seedData() {
  console.log('🌱 Seeding initial data...');
  
  // Buraya seed data kodlarınızı ekleyin
  // ÖRNEK:
  // const existingUsers = await executeQuery('SELECT COUNT(*) as count FROM users');
  // if (existingUsers[0].count === 0) {
  //   await executeNonQuery(`INSERT INTO users (email, name) VALUES ('admin@test.com', 'Admin')`);
  //   console.log('✅ Seed data created');
  // }
  
  console.log('✅ Seeding completed');
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

    // Seed data
    await seedData();
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

export { createTables, seedData };
```

## Adım 5: package.json'a Script Ekle

`package.json` dosyasına şu script'i ekle:

```json
{
  "scripts": {
    "setup-db": "tsx scripts/setup-database.ts"
  }
}
```

## Adım 6: Çalıştır

```bash
npm run setup-db
```

## Önemli Notlar

1. **LocalDB Instance Kontrolü:**
   - LocalDB'nin çalıştığından emin olun: `sqllocaldb info MSSQLLocalDB`
   - Eğer çalışmıyorsa: `sqllocaldb start MSSQLLocalDB`

2. **ODBC Driver:**
   - Windows'ta ODBC Driver 17 for SQL Server yüklü olmalı
   - Yüklü değilse: https://aka.ms/downloadmsodbcsql

3. **Connection String Formatları:**
   - LocalDB: `Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=DB_NAME;Integrated Security=True;`
   - SQL Server Express: `Data Source=localhost\SQLEXPRESS;Initial Catalog=DB_NAME;Integrated Security=True;`
   - Default Instance: `Data Source=localhost;Initial Catalog=DB_NAME;Integrated Security=True;`

4. **Troubleshooting:**
   - Hata: "msnodesqlv8 driver not found" → `npm install msnodesqlv8`
   - Hata: "ODBC Driver not found" → ODBC Driver 17'yi yükleyin
   - Hata: "Database does not exist" → Script otomatik oluşturur, tekrar çalıştırın
   - Hata: "Connection timeout" → LocalDB'nin çalıştığından emin olun

## Hızlı Başlangıç Checklist

- [ ] `npm install mssql msnodesqlv8`
- [ ] `.env.local` dosyası oluşturuldu
- [ ] `lib/db.ts` dosyası oluşturuldu
- [ ] `scripts/setup-database.ts` dosyası oluşturuldu
- [ ] `package.json`'a `setup-db` script'i eklendi
- [ ] `npm run setup-db` çalıştırıldı
- [ ] Veritabanı ve tablolar oluşturuldu ✅

## Örnek Tablo Oluşturma Şablonları

### Basit Tablo
```sql
CREATE TABLE table_name (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

### Foreign Key ile Tablo
```sql
CREATE TABLE orders (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(18,2) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Index ile Tablo
```sql
CREATE TABLE products (
  id INT IDENTITY(1,1) PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  name NVARCHAR(255) NOT NULL,
  price DECIMAL(18,2) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

CREATE INDEX IX_products_slug ON products(slug);
CREATE INDEX IX_products_created_at ON products(created_at);
```

Bu prompt'u kullanarak her yeni projede sorunsuz bir şekilde LocalDB bağlantısı kurabilirsiniz!

