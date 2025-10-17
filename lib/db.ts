// SQL Server Connection (ADO.NET benzeri)
import sql from 'mssql';

// ASP.NET ConnectionString benzeri config
const config: sql.config = {
  server: 'localhost\\MSSQLSERVER01',
  database: 'auraguzellikmerkezi',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  authentication: {
    type: 'ntlm',
    options: {
      domain: '',
      userName: '',
      password: '',
    }
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Connection Pool (singleton)
let pool: sql.ConnectionPool | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✅ SQL Server bağlantısı başarılı!');
  }
  return pool;
}

// ADO.NET SqlCommand benzeri helper
export async function executeQuery<T = any>(query: string, params?: any): Promise<T[]> {
  try {
    const connection = await getConnection();
    const request = connection.request();
    
    // Parameters ekle (ADO.NET SqlParameter benzeri)
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('SQL Hatası:', error);
    throw error;
  }
}

// ADO.NET ExecuteNonQuery benzeri
export async function executeNonQuery(query: string, params?: any): Promise<number> {
  try {
    const connection = await getConnection();
    const request = connection.request();
    
    if (params) {
      Object.keys(params).forEach(key => {
        request.input(key, params[key]);
      });
    }
    
    const result = await request.query(query);
    return result.rowsAffected[0];
  } catch (error) {
    console.error('SQL Hatası:', error);
    throw error;
  }
}

export { sql };

