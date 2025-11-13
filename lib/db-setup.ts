// Database connection for setup scripts (no server-only import)
// This file is used by setup scripts that run outside Next.js runtime
// Uses tedious driver (mssql) for all connections (Vercel-compatible)

import type * as SqlTypes from 'mssql';
import sql from 'mssql';

// Parse DATABASE_URL from environment
function parseDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Check if it's ASP.NET Core connection string format or Node.js format
  if (dbUrl.includes('Data Source=') || dbUrl.includes('Initial Catalog=') || 
      dbUrl.includes('Server=') || dbUrl.includes('Database=')) {
    const parts = dbUrl.split(';').filter(p => p.trim());
    const config: any = {
      server: 'localhost',
      database: '',
      user: '',
      password: '',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
        trustedConnection: false,
      },
    };

    for (const part of parts) {
      const [key, ...valueParts] = part.split('=');
      const value = valueParts.join('=').trim();
      const keyLower = key.trim().toLowerCase();

      if (keyLower === 'data source' || keyLower === 'server') {
        const serverValue = value.trim();
        
        // Handle .\ format (local server with named instance) or IP\Instance format
        if (serverValue === '.' || serverValue.startsWith('.\\')) {
          // For .\ format, we need the actual host - this is likely a remote server
          // Try to extract instance name if present
          if (serverValue.includes('\\')) {
            const instanceName = serverValue.substring(serverValue.indexOf('\\') + 1);
            // For remote hosting, we might need the actual server address
            // But for now, we'll try to use it as-is and let the user know if it fails
            config.server = 'localhost'; // Will need to be updated with actual host
            config.options.instanceName = instanceName;
          } else {
            config.server = 'localhost';
          }
        } else if (serverValue.includes('\\') && !serverValue.startsWith('(localdb)')) {
          // Named instance format: IP\Instance or Domain\Instance
          const parts = serverValue.split('\\');
          if (parts.length === 2) {
            // For remote server, use the IP/domain as server
            config.server = parts[0].trim();
            config.options.instanceName = parts[1].trim();
            config.port = undefined; // Don't use port with named instance
          } else {
            config.server = serverValue;
          }
        } else if (serverValue.startsWith('(localdb)')) {
          const backslashIndex = serverValue.indexOf('\\');
          if (backslashIndex !== -1) {
            config.server = 'localhost';
            config.options.instanceName = serverValue.substring(backslashIndex + 1);
          } else {
            config.server = 'localhost';
            config.options.instanceName = 'MSSQLLocalDB';
          }
        } else if (serverValue.includes(',')) {
          // Server,Port format
          const [server, port] = serverValue.split(',');
          config.server = server.trim();
          config.port = parseInt(port.trim(), 10);
        } else {
          config.server = serverValue;
        }
      } else if (keyLower === 'initial catalog' || keyLower === 'database') {
        config.database = value;
      } else if (keyLower === 'user id' || keyLower === 'uid' || keyLower === 'user') {
        config.user = value;
      } else if (keyLower === 'password' || keyLower === 'pwd') {
        config.password = value;
      } else if (keyLower === 'integrated security') {
        config.options.trustedConnection = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
      } else if (keyLower === 'encrypt') {
        config.options.encrypt = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
      } else if (keyLower === 'trustservercertificate') {
        config.options.trustServerCertificate = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
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

  // Use tedious driver for all connections (Vercel-compatible)
  // Note: LocalDB connections are not supported in production
  // All connections should use remote SQL Server with TCP/IP

  sqlConfig = {
    server: dbConfig.server,
    database: dbConfig.database,
    user: dbConfig.user || undefined,
    password: dbConfig.password || undefined,
    port: dbConfig.port || undefined,
    connectionTimeout: 30000, // 30 seconds
    requestTimeout: 30000, // 30 seconds
    options: {
      encrypt: dbConfig.options?.encrypt || false,
      trustServerCertificate: dbConfig.options?.trustServerCertificate ?? true,
      enableArithAbort: true,
      trustedConnection: dbConfig.options?.trustedConnection ?? false,
      instanceName: dbConfig.options?.instanceName || undefined,
      cryptoCredentialsDetails: {
        minVersion: 'TLSv1.2'
      }
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000,
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

