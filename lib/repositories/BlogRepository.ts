import sql from 'mssql';
import { Blog, CreateBlogDto, UpdateBlogDto } from '../models/Blog';

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

class BlogRepository {
  private static pool: sql.ConnectionPool | null = null;

  private static async getPool(): Promise<sql.ConnectionPool> {
    try {
      if (!this.pool) {
        this.pool = await sql.connect(config);
        console.log('✅ SQL Server bağlantısı başarılı!');
      }
      return this.pool;
    } catch (error) {
      console.error('❌ SQL Server bağlantı hatası:', error);
      throw error;
    }
  }

  // EF: context.Blogs.ToListAsync()
  static async findAll(): Promise<Blog[]> {
    const pool = await this.getPool();
    const result = await pool.request()
      .query('SELECT * FROM Blogs ORDER BY createdAt DESC');
    return result.recordset;
  }

  // EF: context.Blogs.Where(b => b.Published == true).ToListAsync()
  static async findPublished(): Promise<Blog[]> {
    const pool = await this.getPool();
    const result = await pool.request()
      .query('SELECT * FROM Blogs WHERE published = 1 ORDER BY createdAt DESC');
    return result.recordset;
  }

  // EF: context.Blogs.FindAsync(id)
  static async findById(id: number): Promise<Blog | null> {
    const pool = await this.getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Blogs WHERE id = @id');
    return result.recordset[0] || null;
  }

  // EF: context.Blogs.FirstOrDefaultAsync(b => b.Slug == slug)
  static async findBySlug(slug: string): Promise<Blog | null> {
    const pool = await this.getPool();
    const result = await pool.request()
      .input('slug', sql.VarChar(250), slug)
      .query('SELECT * FROM Blogs WHERE slug = @slug');
    return result.recordset[0] || null;
  }

  // EF: context.Blogs.Add(blog); context.SaveChangesAsync();
  static async create(data: CreateBlogDto): Promise<Blog> {
    const pool = await this.getPool();
    
    // Slug oluştur
    const slug = data.title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const result = await pool.request()
      .input('title', sql.NVarChar(200), data.title)
      .input('slug', sql.VarChar(250), slug)
      .input('content', sql.NVarChar(sql.MAX), data.content)
      .input('excerpt', sql.NVarChar(500), data.excerpt || null)
      .input('image', sql.VarChar(500), data.image || null)
      .input('published', sql.Bit, data.published || false)
      .query(`
        INSERT INTO Blogs (title, slug, content, excerpt, image, published, createdAt, updatedAt)
        OUTPUT INSERTED.*
        VALUES (@title, @slug, @content, @excerpt, @image, @published, GETDATE(), GETDATE())
      `);

    return result.recordset[0];
  }

  // EF: context.Blogs.Update(blog); context.SaveChangesAsync();
  static async update(id: number, data: UpdateBlogDto): Promise<Blog | null> {
    const pool = await this.getPool();
    
    const updates: string[] = [];
    const request = pool.request();

    if (data.title !== undefined) {
      updates.push('title = @title');
      request.input('title', sql.NVarChar(200), data.title);
      
      // Slug güncelle
      const slug = data.title
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      updates.push('slug = @slug');
      request.input('slug', sql.VarChar(250), slug);
    }

    if (data.content !== undefined) {
      updates.push('content = @content');
      request.input('content', sql.NVarChar(sql.MAX), data.content);
    }

    if (data.excerpt !== undefined) {
      updates.push('excerpt = @excerpt');
      request.input('excerpt', sql.NVarChar(500), data.excerpt);
    }

    if (data.image !== undefined) {
      updates.push('image = @image');
      // null gelirse SQL'de NULL yap, string gelirse o değeri yaz
      request.input('image', sql.VarChar(500), data.image === null ? null : data.image);
    }

    if (data.published !== undefined) {
      updates.push('published = @published');
      request.input('published', sql.Bit, data.published);
    }

    updates.push('updatedAt = GETDATE()');

    if (updates.length === 0) return null;

    request.input('id', sql.Int, id);
    const result = await request.query(`
      UPDATE Blogs 
      SET ${updates.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    return result.recordset[0] || null;
  }

  // EF: context.Blogs.Remove(blog); context.SaveChangesAsync();
  static async delete(id: number): Promise<boolean> {
    const pool = await this.getPool();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Blogs WHERE id = @id');
    
    return result.rowsAffected[0] > 0;
  }
}

export default BlogRepository;

