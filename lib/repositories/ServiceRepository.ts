// Service Repository - MSSQL Operations
import sql from 'mssql';
import { Service, CreateServiceDto, UpdateServiceDto } from '../models/Service';

// MSSQL Connection Config
const config: sql.config = {
  server: '104.247.167.194\\MSSQLSERVER2019',
  database: 'sitenhaz_sitenhazirDb',
  user: 'sitenhaz_sitenhazir',
  password: 'H2!Zh86dzxrp@Mbw',
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

export default class ServiceRepository {
  // Connection pool (singleton)
  private static pool: sql.ConnectionPool | null = null;

  private static async getPool(): Promise<sql.ConnectionPool> {
    if (!this.pool) {
      this.pool = await sql.connect(config);
    }
    return this.pool;
  }

  // Slug oluşturma helper (Türkçe karakter desteği)
  private static generateSlug(title: string): string {
    const trMap: { [key: string]: string } = {
      'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
      'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
    };

    return title
      .split('')
      .map(char => trMap[char] || char)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Tüm hizmetleri getir (Admin için)
  static async findAll(): Promise<Service[]> {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .query(`
          SELECT id, title, slug, excerpt, content, image, published, createdAt, updatedAt
          FROM Services
          ORDER BY createdAt DESC
        `);

      return result.recordset as Service[];
    } catch (error) {
      console.error('ServiceRepository.findAll error:', error);
      throw new Error('Hizmetler getirilemedi');
    }
  }

  // Yayındaki hizmetleri getir (Frontend için)
  static async findPublished(): Promise<Service[]> {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .query(`
          SELECT id, title, slug, excerpt, content, image, published, createdAt, updatedAt
          FROM Services
          WHERE published = 1
          ORDER BY createdAt DESC
        `);

      return result.recordset as Service[];
    } catch (error) {
      console.error('ServiceRepository.findPublished error:', error);
      throw new Error('Hizmetler getirilemedi');
    }
  }

  // ID ile hizmet bul
  static async findById(id: number): Promise<Service | null> {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          SELECT id, title, slug, excerpt, content, image, published, createdAt, updatedAt
          FROM Services
          WHERE id = @id
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0] as Service;
    } catch (error) {
      console.error('ServiceRepository.findById error:', error);
      throw new Error('Hizmet bulunamadı');
    }
  }

  // Slug ile hizmet bul (Frontend detay sayfası için)
  static async findBySlug(slug: string): Promise<Service | null> {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('slug', sql.VarChar(250), slug)
        .query(`
          SELECT id, title, slug, excerpt, content, image, published, createdAt, updatedAt
          FROM Services
          WHERE slug = @slug
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0] as Service;
    } catch (error) {
      console.error('ServiceRepository.findBySlug error:', error);
      throw new Error('Hizmet bulunamadı');
    }
  }

  // Yeni hizmet oluştur
  static async create(data: CreateServiceDto): Promise<Service> {
    try {
      const pool = await this.getPool();
      
      const slug = this.generateSlug(data.title);
      
      const result = await pool.request()
        .input('title', sql.NVarChar(200), data.title)
        .input('slug', sql.VarChar(250), slug)
        .input('content', sql.NVarChar(sql.MAX), data.content)
        .input('excerpt', sql.NVarChar(500), data.excerpt || null)
        .input('image', sql.VarChar(500), data.image || null)
        .input('published', sql.Bit, data.published || false)
        .query(`
          INSERT INTO Services (title, slug, content, excerpt, image, published, createdAt, updatedAt)
          OUTPUT INSERTED.*
          VALUES (@title, @slug, @content, @excerpt, @image, @published, GETDATE(), GETDATE())
        `);

      return result.recordset[0] as Service;
    } catch (error: any) {
      console.error('ServiceRepository.create error:', error);
      if (error.message.includes('duplicate') || error.message.includes('UNIQUE')) {
        throw new Error('Bu hizmet başlığı zaten kullanılıyor');
      }
      throw new Error('Hizmet oluşturulamadı');
    }
  }

  // Hizmet güncelle
  static async update(id: number, data: UpdateServiceDto): Promise<Service | null> {
    try {
      const pool = await this.getPool();
      const request = pool.request();
      
      const updates: string[] = [];
      
      if (data.title !== undefined) {
        updates.push('title = @title');
        request.input('title', sql.NVarChar(200), data.title);
        
        // Başlık değişirse slug'ı da güncelle
        const newSlug = this.generateSlug(data.title);
        updates.push('slug = @slug');
        request.input('slug', sql.VarChar(250), newSlug);
      }
      
      if (data.content !== undefined) {
        updates.push('content = @content');
        request.input('content', sql.NVarChar(sql.MAX), data.content);
      }
      
      if (data.excerpt !== undefined) {
        updates.push('excerpt = @excerpt');
        request.input('excerpt', sql.NVarChar(500), data.excerpt || null);
      }
      
      if (data.image !== undefined) {
        updates.push('image = @image');
        request.input('image', sql.VarChar(500), data.image === null ? null : data.image);
      }
      
      if (data.published !== undefined) {
        updates.push('published = @published');
        request.input('published', sql.Bit, data.published);
      }
      
      // updatedAt her zaman güncellenir
      updates.push('updatedAt = GETDATE()');
      
      request.input('id', sql.Int, id);
      
      const result = await request.query(`
        UPDATE Services
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0] as Service;
    } catch (error) {
      console.error('ServiceRepository.update error:', error);
      throw new Error('Hizmet güncellenemedi');
    }
  }

  // Hizmet sil
  static async delete(id: number): Promise<boolean> {
    try {
      const pool = await this.getPool();
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          DELETE FROM Services
          WHERE id = @id
        `);

      return (result.rowsAffected[0] || 0) > 0;
    } catch (error) {
      console.error('ServiceRepository.delete error:', error);
      throw new Error('Hizmet silinemedi');
    }
  }
}

