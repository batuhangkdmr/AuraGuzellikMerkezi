// SQL Server Connection - Supports both LocalDB (via msnodesqlv8) and regular SQL Server (via tedious)
// LocalDB requires msnodesqlv8 for Named Pipes support
import 'server-only';

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

  // Check if it's simple Server= format (Node.js style)
  if (dbUrl.includes('Server=') && !dbUrl.includes('Data Source=')) {
    const parts = dbUrl.split(';').filter(p => p.trim());
    const config: any = {
      server: 'localhost',
      database: '',
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

      if (keyLower === 'server') {
        const serverValue = value.trim();
        if (serverValue.includes('\\')) {
          const parts = serverValue.split('\\');
          if (parts.length === 2) {
            config.server = parts[0] === 'localhost' ? 'localhost' : parts[0];
            config.options.instanceName = parts[1];
          } else {
            config.server = serverValue;
          }
        } else {
          config.server = serverValue;
        }
      } else if (keyLower === 'database') {
        config.database = value;
      } else if (keyLower === 'trusted_connection' || keyLower === 'trusted connection') {
        config.options.trustedConnection = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
      } else if (keyLower === 'user id' || keyLower === 'uid') {
        config.user = value;
      } else if (keyLower === 'password' || keyLower === 'pwd') {
        config.password = value;
      }
    }

    return config;
  }

  // Check if it's ASP.NET Core connection string format
  if (dbUrl.includes('Data Source=') || dbUrl.includes('Initial Catalog=')) {
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
        // Parse server and instance (e.g., "(localdb)\MSSQLLocalDB" or "localhost\MSSQLSERVER01" or "localhost,1433" or "IP\Instance")
        const serverValue = value.trim();
        
        // Check if port is specified (e.g., "localhost,1433")
        if (serverValue.includes(',') && !serverValue.includes('\\')) {
          const [server, port] = serverValue.split(',');
          config.server = server.trim();
          config.port = parseInt(port.trim(), 10);
          // Continue to parse other parts (database, etc.) - don't check other formats
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
          // Named instance (e.g., "localhost\MSSQLSERVER01" or "104.247.167.194\MSSQLSERVER2019")
          // Check if port is also specified: "IP\Instance,Port"
          if (serverValue.includes(',')) {
            // Format: "IP\Instance,Port"
            const [instancePart, portPart] = serverValue.split(',');
            const instanceParts = instancePart.split('\\');
            if (instanceParts.length === 2) {
              config.server = instanceParts[0].trim();
              config.options.instanceName = instanceParts[1].trim();
              config.port = parseInt(portPart.trim(), 10);
            } else {
              config.server = serverValue;
            }
          } else {
            // Format: "IP\Instance" (no port)
            const parts = serverValue.split('\\');
            if (parts.length === 2) {
              config.server = parts[0].trim();
              config.options.instanceName = parts[1].trim();
              // For named instances without port, don't use port (will try SQL Server Browser)
              config.port = undefined;
            } else {
              config.server = serverValue;
            }
          }
        } else {
          config.server = serverValue;
        }
      } else if (keyLower === 'initial catalog' || keyLower === 'database') {
        config.database = value;
      } else if (keyLower === 'integrated security') {
        config.options.trustedConnection = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
      } else if (keyLower === 'user id' || keyLower === 'uid' || keyLower === 'user') {
        config.user = value;
      } else if (keyLower === 'password' || keyLower === 'pwd') {
        config.password = value;
      } else if (keyLower === 'encrypt') {
        config.options.encrypt = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
      } else if (keyLower === 'trust server certificate' || keyLower === 'trustservercertificate') {
        config.options.trustServerCertificate = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
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
  // Always parse fresh config (in case DATABASE_URL changed)
  const dbConfig = parseDatabaseUrl();
  
  // Reset config if DATABASE_URL changed
  if (sqlConfig && sqlConfig.server !== dbConfig.server) {
    sqlConfig = null;
  }
  
  if (sqlConfig) {
    return sqlConfig;
  }

  // Check if this is LocalDB
  const isLocalDB = dbConfig.options?.instanceName === 'MSSQLLocalDB' || 
                    (dbConfig.server === 'localhost' && dbConfig.options?.instanceName === 'MSSQLLocalDB') ||
                    dbConfig.server?.toLowerCase().includes('localdb');
  
  // For LocalDB, use msnodesqlv8 driver (supports Named Pipes)
  if (isLocalDB) {
    // Try to load msnodesqlv8 for LocalDB
    try {
      sql = require('mssql/msnodesqlv8');
      usingMsnodesqlv8 = true;
      
      // msnodesqlv8 requires connectionString format (ODBC connection string)
      // Try different ODBC drivers in order of preference
      const odbcDrivers = [
        'ODBC Driver 17 for SQL Server',
        'ODBC Driver 13 for SQL Server',
        'SQL Server Native Client 11.0',
        'SQL Server'
      ];
      
      // Build connection string for msnodesqlv8
      const instanceName = dbConfig.options?.instanceName || 'MSSQLLocalDB';
      const database = dbConfig.database || 'auraguzellikmerkezi2';
      
      // Try first driver (most common)
      const connectionString = `Driver={${odbcDrivers[0]}};Server=(localdb)\\${instanceName};Database=${database};Trusted_Connection=Yes;`;
      
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
  
  // Check if this is a named instance (has instanceName option) but not LocalDB
  const isNamedInstance = dbConfig.options?.instanceName && 
                          dbConfig.options?.instanceName !== 'MSSQLLocalDB';
  
  // Create mssql config for SQL Server
  sqlConfig = {
    server: dbConfig.server,
    database: dbConfig.database,
    user: dbConfig.user || undefined,
    password: dbConfig.password || undefined,
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

  // For named instances, tedious needs SQL Server Browser to find the port
  // SQL Server Browser uses UDP port 1434
  // If SQL Server Browser is not available, we need to specify the port explicitly
  if (isNamedInstance) {
    // Use port if specified in connection string (e.g., "IP\Instance,Port")
    // Otherwise, don't set port - let tedious try SQL Server Browser
    // If SQL Server Browser is not available and no port specified, this will fail
    if (dbConfig.port) {
      sqlConfig.port = dbConfig.port;
    } else {
      sqlConfig.port = undefined;
    }
  } else if (dbConfig.port) {
    // Use explicit port if specified
    sqlConfig.port = dbConfig.port;
  } else {
    // Default to 1433 only if no instance name and no port specified
    sqlConfig.port = 1433;
  }

  // Debug: Log connection config (without password)
  console.log('🔍 SQL Connection Config:', {
    server: sqlConfig.server,
    database: sqlConfig.database,
    user: sqlConfig.user,
    port: sqlConfig.port,
    instanceName: sqlConfig.options?.instanceName,
    encrypt: sqlConfig.options?.encrypt,
    trustedConnection: sqlConfig.options?.trustedConnection,
  });

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
    // If connection failed, try to reconnect
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
  // Force config to be recalculated next time (needed when DATABASE_URL changes)
  sqlConfig = null;
}

// Execute query and return results
export async function executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
  try {
    const connection = await getConnection();
    const request = connection.request();
    
    // Add parameters
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

// Execute query and return single result
export async function executeQueryOne<T = any>(query: string, params?: Record<string, any>): Promise<T | null> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
}

// Execute non-query (INSERT, UPDATE, DELETE)
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

export { sql };
