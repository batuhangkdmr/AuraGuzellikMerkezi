// Database connection for setup scripts (no server-only import)
// This file is used by setup scripts that run outside Next.js runtime

import type * as SqlTypes from 'mssql';
let sql: any;
let usingMsnodesqlv8 = false;

// Parse DATABASE_URL from environment
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
        
        if (serverValue.startsWith('(localdb)')) {
          const backslashIndex = serverValue.indexOf('\\');
          if (backslashIndex !== -1) {
            config.server = 'localhost';
            config.options.instanceName = serverValue.substring(backslashIndex + 1);
          } else {
            config.server = 'localhost';
            config.options.instanceName = 'MSSQLLocalDB';
          }
        } else if (serverValue.includes('\\')) {
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
      }
    }

    return config;
  }

  throw new Error(`Invalid DATABASE_URL format: ${dbUrl}`);
}

// Lazy load config
let sqlConfig: any = null;

function getSqlConfig(): any {
  if (sqlConfig) {
    return sqlConfig;
  }

  const dbConfig = parseDatabaseUrl();

  // Check if this is LocalDB
  const isLocalDB = dbConfig.options?.instanceName === 'MSSQLLocalDB' || 
                    (dbConfig.server === 'localhost' && dbConfig.options?.instanceName === 'MSSQLLocalDB');
  
  // For LocalDB, use msnodesqlv8 driver
  if (isLocalDB) {
    try {
      sql = require('mssql/msnodesqlv8');
      usingMsnodesqlv8 = true;
      
      const instanceName = dbConfig.options?.instanceName || 'MSSQLLocalDB';
      const database = dbConfig.database || 'auraguzellikmerkezi2';
      
      const connectionString = `Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\${instanceName};Database=${database};Trusted_Connection=Yes;`;
      
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

  sqlConfig = {
    server: dbConfig.server,
    database: dbConfig.database,
    options: {
      encrypt: dbConfig.options?.encrypt || false,
      trustServerCertificate: dbConfig.options?.trustServerCertificate ?? true,
      enableArithAbort: true,
      trustedConnection: dbConfig.options?.trustedConnection ?? true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };

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
  
  return pool!;
}

export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('✅ SQL Server bağlantısı kapatıldı');
  }
  sqlConfig = null;
}

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

export async function executeQueryOne<T = any>(query: string, params?: Record<string, any>): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
}

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

