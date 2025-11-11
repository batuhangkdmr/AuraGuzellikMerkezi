import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string | null; // JSON array as string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProductRepository {
  // Check if is_active column exists (for backward compatibility)
  private static async hasIsActiveColumn(): Promise<boolean> {
    try {
      const result = await executeQueryOne<{ column_exists: number }>(
        `SELECT CASE 
          WHEN EXISTS (
            SELECT * FROM sys.columns 
            WHERE object_id = OBJECT_ID(N'dbo.products') 
            AND name = 'is_active'
          ) THEN 1 ELSE 0 END as column_exists`
      );
      return result?.column_exists === 1;
    } catch {
      return false;
    }
  }

  // Find product by ID (admin can see inactive products)
  static async findById(id: number, includeInactive: boolean = false): Promise<Product | null> {
    try {
      // Try with is_active column first
      const whereClause = includeInactive ? 'WHERE id = @id' : 'WHERE id = @id AND is_active = 1';
      const result = await executeQueryOne<Product>(
        `SELECT id, name, slug, description, price, stock, images, 
                is_active as isActive,
                created_at as createdAt, updated_at as updatedAt 
         FROM products ${whereClause}`,
        { id }
      );
      return result;
    } catch (error: any) {
      // If is_active column doesn't exist (error 207), fall back to stock-based check
      if (error?.number === 207) {
        const whereClause = includeInactive 
          ? 'WHERE id = @id' 
          : 'WHERE id = @id AND stock > 0';
        const result = await executeQueryOne<Product>(
          `SELECT id, name, slug, description, price, stock, images, 
                  CASE WHEN stock > 0 THEN 1 ELSE 0 END as isActive,
                  created_at as createdAt, updated_at as updatedAt 
           FROM products ${whereClause}`,
          { id }
        );
        if (result) {
          result.isActive = result.stock > 0;
        }
        return result;
      }
      console.error('Error in findById:', error);
      throw error;
    }
  }

  // Find product by slug (only active products for public)
  static async findBySlug(slug: string, includeInactive: boolean = false): Promise<Product | null> {
    try {
      // Try with is_active column first
      const whereClause = includeInactive 
        ? 'WHERE slug = @slug' 
        : 'WHERE slug = @slug AND is_active = 1 AND stock > 0';
      const result = await executeQueryOne<Product>(
        `SELECT id, name, slug, description, price, stock, images, 
                is_active as isActive,
                created_at as createdAt, updated_at as updatedAt 
         FROM products ${whereClause}`,
        { slug }
      );
      return result;
    } catch (error: any) {
      // If is_active column doesn't exist (error 207), fall back to stock-based check
      if (error?.number === 207) {
        const whereClause = includeInactive 
          ? 'WHERE slug = @slug' 
          : 'WHERE slug = @slug AND stock > 0';
        const result = await executeQueryOne<Product>(
          `SELECT id, name, slug, description, price, stock, images, 
                  CASE WHEN stock > 0 THEN 1 ELSE 0 END as isActive,
                  created_at as createdAt, updated_at as updatedAt 
           FROM products ${whereClause}`,
          { slug }
        );
        if (result) {
          result.isActive = result.stock > 0;
        }
        return result;
      }
      console.error('Error in findBySlug:', error);
      throw error;
    }
  }

  // Find all products (public - only active and in stock)
  static async findAll(includeInactive: boolean = false): Promise<Product[]> {
    try {
      // Try with is_active column first
      const whereClause = includeInactive 
        ? '' 
        : 'WHERE is_active = 1 AND stock > 0';
      const results = await executeQuery<Product>(
        `SELECT id, name, slug, description, price, stock, images, 
                is_active as isActive,
                created_at as createdAt, updated_at as updatedAt 
         FROM products ${whereClause}
         ORDER BY created_at DESC`
      );
      return results;
    } catch (error: any) {
      // If is_active column doesn't exist (error 207), fall back to stock-based check
      if (error?.number === 207) {
        const whereClause = includeInactive ? '' : 'WHERE stock > 0';
        const results = await executeQuery<Product>(
          `SELECT id, name, slug, description, price, stock, images, 
                  CASE WHEN stock > 0 THEN 1 ELSE 0 END as isActive,
                  created_at as createdAt, updated_at as updatedAt 
           FROM products ${whereClause}
           ORDER BY created_at DESC`
        );
        return results.map(p => ({
          ...p,
          isActive: p.stock > 0,
        }));
      }
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  // Create product
  static async create(productData: {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images?: string | null;
    isActive?: boolean;
  }): Promise<Product> {
    // Set is_active based on stock (if stock > 0, active = true)
    const isActive = productData.isActive !== undefined ? productData.isActive : (productData.stock > 0);
    
    try {
      // Try to create with is_active column
      const result = await executeQueryOne<{ id: number }>(
        `INSERT INTO products (name, slug, description, price, stock, images, is_active, created_at, updated_at)
         OUTPUT INSERTED.id
         VALUES (@name, @slug, @description, @price, @stock, @images, @isActive, GETDATE(), GETDATE())`,
        {
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          images: productData.images || null,
          isActive: isActive ? 1 : 0,
        }
      );
      
      if (!result) {
        throw new Error('Failed to create product');
      }
      
      const product = await this.findById(result.id, true);
      if (!product) {
        throw new Error('Failed to retrieve created product');
      }
      return product;
    } catch (error: any) {
      // If is_active column doesn't exist (error 207), create without it
      if (error?.number === 207) {
        const result = await executeQueryOne<{ id: number }>(
          `INSERT INTO products (name, slug, description, price, stock, images, created_at, updated_at)
           OUTPUT INSERTED.id
           VALUES (@name, @slug, @description, @price, @stock, @images, GETDATE(), GETDATE())`,
          {
            name: productData.name,
            slug: productData.slug,
            description: productData.description,
            price: productData.price,
            stock: productData.stock,
            images: productData.images || null,
          }
        );
        
        if (!result) {
          throw new Error('Failed to create product');
        }
        
        const product = await this.findById(result.id, true);
        if (!product) {
          throw new Error('Failed to retrieve created product');
        }
        return product;
      }
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  static async update(id: number, updates: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images: string | null;
    isActive: boolean;
  }>): Promise<Product | null> {
    const fields: string[] = [];
    const params: Record<string, any> = { id };

    if (updates.name !== undefined) {
      fields.push('name = @name');
      params.name = updates.name;
    }
    if (updates.slug !== undefined) {
      fields.push('slug = @slug');
      params.slug = updates.slug;
    }
    if (updates.description !== undefined) {
      fields.push('description = @description');
      params.description = updates.description;
    }
    if (updates.price !== undefined) {
      fields.push('price = @price');
      params.price = updates.price;
    }
    if (updates.stock !== undefined) {
      fields.push('stock = @stock');
      params.stock = updates.stock;
      // Try to auto-update is_active based on stock if isActive is not explicitly set
      if (updates.isActive === undefined) {
        fields.push('is_active = CASE WHEN @stock > 0 THEN 1 ELSE 0 END');
      }
    }
    if (updates.images !== undefined) {
      fields.push('images = @images');
      params.images = updates.images;
    }
    if (updates.isActive !== undefined) {
      fields.push('is_active = @isActive');
      params.isActive = updates.isActive ? 1 : 0;
    }

    if (fields.length === 0) {
      return await this.findById(id, true); // Include inactive for admin
    }

    fields.push('updated_at = GETDATE()');

    try {
      await executeNonQuery(
        `UPDATE products SET ${fields.join(', ')} WHERE id = @id`,
        params
      );

      return await this.findById(id, true); // Include inactive for admin
    } catch (error: any) {
      // If is_active column doesn't exist (error 207), update without it
      if (error?.number === 207) {
        // Remove is_active related fields and try again
        const fieldsWithoutIsActive = fields.filter(f => !f.includes('is_active'));
        if (fieldsWithoutIsActive.length > 0) {
          // Remove is_active from params if it exists
          const paramsWithoutIsActive = { ...params };
          delete paramsWithoutIsActive.isActive;
          
          await executeNonQuery(
            `UPDATE products SET ${fieldsWithoutIsActive.join(', ')} WHERE id = @id`,
            paramsWithoutIsActive
          );
        }
        return await this.findById(id, true);
      }
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  static async delete(id: number): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'DELETE FROM products WHERE id = @id',
      { id }
    );
    return rowsAffected > 0;
  }

  // Helper method to parse images JSON
  static parseImages(images: string | null): string[] {
    if (!images) return [];
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  }

  // Helper method to stringify images array
  static stringifyImages(urls: string[]): string {
    return JSON.stringify(urls);
  }
}


