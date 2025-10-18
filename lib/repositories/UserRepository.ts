// User Repository - MSSQL Operations
import sql from 'mssql';
import { User, CreateUserDto, PublicUser } from '../models/User';

// MSSQL Connection Config
const config: sql.config = {
  server: process.env.DB_SERVER || '104.247.167.194\\MSSQLSERVER2019',
  database: process.env.DB_DATABASE || 'sitenhaz_sitenhazirDb',
  user: process.env.DB_USER || 'sitenhaz_sitenhazir',
  password: process.env.DB_PASSWORD || 'H2!Zh86dzxrp@Mbw',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

export class UserRepository {
  // Connection pool (singleton)
  private static pool: sql.ConnectionPool | null = null;

  private static async getPool(): Promise<sql.ConnectionPool> {
    if (!this.pool) {
      this.pool = await sql.connect(config);
    }
    return this.pool;
  }

  // Username ile kullanıcı bul (Login için)
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('username', sql.NVarChar(50), username)
        .query(`
          SELECT id, username, password, role, lastLoginAt, createdAt, updatedAt
          FROM Users
          WHERE username = @username
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0] as User;
    } catch (error) {
      console.error('UserRepository.findByUsername error:', error);
      throw new Error('Kullanıcı bulunamadı');
    }
  }

  // ID ile kullanıcı bul
  static async findById(id: number): Promise<User | null> {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT id, username, password, role, lastLoginAt, createdAt, updatedAt
          FROM Users
          WHERE id = @id
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0] as User;
    } catch (error) {
      console.error('UserRepository.findById error:', error);
      throw new Error('Kullanıcı bulunamadı');
    }
  }

  // Yeni kullanıcı oluştur (Register)
  static async create(data: CreateUserDto): Promise<User> {
    try {
      const pool = await this.getPool();
      
      // Username benzersiz mi kontrol et
      const existing = await this.findByUsername(data.username);
      if (existing) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor');
      }

      const result = await pool.request()
        .input('username', sql.NVarChar(50), data.username)
        .input('password', sql.VarChar(255), data.password) // Hash'lenmiş şifre gelecek
        .input('role', sql.VarChar(20), data.role || 'user')
        .query(`
          INSERT INTO Users (username, password, role, createdAt, updatedAt)
          OUTPUT INSERTED.*
          VALUES (@username, @password, @role, GETDATE(), GETDATE())
        `);

      return result.recordset[0] as User;
    } catch (error: any) {
      console.error('UserRepository.create error:', error);
      if (error.message === 'Bu kullanıcı adı zaten kullanılıyor') {
        throw error;
      }
      throw new Error('Kullanıcı oluşturulamadı');
    }
  }

  // Son giriş zamanını güncelle
  static async updateLastLogin(id: number): Promise<void> {
    try {
      const pool = await this.getPool();
      await pool.request()
        .input('id', sql.Int, id)
        .query(`
          UPDATE Users
          SET lastLoginAt = GETDATE()
          WHERE id = @id
        `);
    } catch (error) {
      console.error('UserRepository.updateLastLogin error:', error);
      // Hata fırlatma, sadece log et (kritik değil)
    }
  }

  // Public user bilgisi (şifre olmadan)
  static toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  // Tüm kullanıcıları listele (Admin için)
  static async findAll(): Promise<PublicUser[]> {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .query(`
          SELECT id, username, role, lastLoginAt, createdAt
          FROM Users
          ORDER BY createdAt DESC
        `);

      return result.recordset as PublicUser[];
    } catch (error) {
      console.error('UserRepository.findAll error:', error);
      throw new Error('Kullanıcılar listelenemedi');
    }
  }
}

