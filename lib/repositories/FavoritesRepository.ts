import { executeQuery, executeQueryOne, executeNonQuery } from '@/lib/db';

export interface Favorite {
  id: number;
  userId: number;
  productId: number;
  createdAt: Date;
}

export interface FavoriteWithProduct extends Favorite {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string | null;
    stock: number;
  };
}

export class FavoritesRepository {
  /**
   * Add product to favorites
   */
  static async add(userId: number, productId: number): Promise<Favorite> {
    let result: { id: number } | null = null;
    
    try {
      result = await executeQueryOne<{ id: number }>(
        `INSERT INTO favorites (user_id, product_id, created_at)
         OUTPUT INSERTED.id
         VALUES (@userId, @productId, GETDATE())`,
        { userId, productId }
      );

      if (!result) {
        throw new Error('Failed to add favorite');
      }
    } catch (error: any) {
      // Handle unique constraint violation (already in favorites)
      if (error && typeof error === 'object' && 'number' in error && error.number === 2627) {
        throw new Error('Bu ürün zaten favorilerinizde');
      }
      // Handle table doesn't exist error
      if (error && typeof error === 'object' && 'number' in error && error.number === 208) {
        throw new Error('Favoriler tablosu bulunamadı. Lütfen SQL-FAVORITES.sql scriptini çalıştırın.');
      }
      // Handle invalid column name
      if (error && typeof error === 'object' && 'number' in error && error.number === 207) {
        throw new Error('Favoriler tablosu yapısı hatalı. Lütfen SQL-FAVORITES.sql scriptini çalıştırın.');
      }
      throw error;
    }

    if (!result) {
      throw new Error('Failed to add favorite');
    }

    const favorite = await executeQueryOne<Favorite>(
      `SELECT id, user_id as userId, product_id as productId, 
              CONVERT(VARCHAR(23), created_at, 126) as createdAt
       FROM favorites
       WHERE id = @id`,
      { id: result.id }
    );

    if (!favorite) {
      throw new Error('Failed to retrieve favorite');
    }

    return {
      ...favorite,
      createdAt: this.parseSqlDate(favorite.createdAt as any),
    };
  }

  /**
   * Remove product from favorites
   */
  static async remove(userId: number, productId: number): Promise<boolean> {
    const result = await executeNonQuery(
      `DELETE FROM favorites
       WHERE user_id = @userId AND product_id = @productId`,
      { userId, productId }
    );

    return result > 0;
  }

  /**
   * Check if product is in favorites
   */
  static async isFavorite(userId: number, productId: number): Promise<boolean> {
    try {
      const result = await executeQueryOne<{ count: number }>(
        `SELECT COUNT(*) as count
         FROM favorites
         WHERE user_id = @userId AND product_id = @productId`,
        { userId, productId }
      );

      return (result?.count || 0) > 0;
    } catch (error: any) {
      // Handle table doesn't exist error - return false instead of throwing
      if (error && typeof error === 'object' && 'number' in error && (error.number === 208 || error.number === 207)) {
        console.warn('Favorites table not found, returning false');
        return false;
      }
      throw error;
    }
  }

  /**
   * Get all favorites for a user with product details
   */
  static async findByUserId(userId: number): Promise<FavoriteWithProduct[]> {
    try {
      const results = await executeQuery<FavoriteWithProduct & { createdAt: string }>(
        `SELECT 
          f.id,
          f.user_id as userId,
          f.product_id as productId,
          CONVERT(VARCHAR(23), f.created_at, 126) as createdAt,
          p.id as product_id,
          p.name as product_name,
          p.slug as product_slug,
          p.price as product_price,
          p.images as product_images,
          p.stock as product_stock
         FROM favorites f
         INNER JOIN products p ON f.product_id = p.id
         WHERE f.user_id = @userId
         ORDER BY f.created_at DESC`,
        { userId }
      );

      return results.map((item: any) => {
        let createdAt: Date;
        try {
          createdAt = this.parseSqlDate(item.createdAt);
        } catch (dateError) {
          console.error('Error parsing date in findByUserId:', dateError, 'Raw date:', item.createdAt);
          createdAt = new Date(); // Fallback to current date
        }

        return {
          id: item.id,
          userId: item.userId,
          productId: item.productId,
          createdAt,
          product: {
            id: item.product_id,
            name: item.product_name,
            slug: item.product_slug,
            price: item.product_price,
            images: item.product_images,
            stock: item.product_stock,
          },
        };
      });
    } catch (error: any) {
      // Handle table doesn't exist error
      if (error && typeof error === 'object' && 'number' in error && error.number === 208) {
        throw new Error('Favoriler tablosu bulunamadı. Lütfen SQL-FAVORITES.sql scriptini çalıştırın.');
      }
      // Handle invalid column name
      if (error && typeof error === 'object' && 'number' in error && error.number === 207) {
        throw new Error('Favoriler veya ürünler tablosu yapısı hatalı. Lütfen veritabanı şemasını kontrol edin.');
      }
      // Handle foreign key or other SQL errors
      console.error('Error in findByUserId:', error);
      throw error;
    }
  }

  /**
   * Get favorite count for a product
   */
  static async getProductFavoriteCount(productId: number): Promise<number> {
    const result = await executeQueryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM favorites
       WHERE product_id = @productId`,
      { productId }
    );

    return result?.count || 0;
  }

  /**
   * Parse SQL Server datetime string to Date
   */
  private static parseSqlDate(dateString: string): Date {
    // SQL Server returns ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sss
    // Parse as local time to avoid UTC conversion issues
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [time, ms] = timePart.split('.');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const milliseconds = ms ? parseInt(ms.substring(0, 3), 10) : 0;

    return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
  }
}

