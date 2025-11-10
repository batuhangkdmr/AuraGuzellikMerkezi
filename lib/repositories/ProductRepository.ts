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
  createdAt: Date;
  updatedAt: Date;
}

export class ProductRepository {
  // Find product by ID
  static async findById(id: number): Promise<Product | null> {
    const result = await executeQueryOne<Product>(
      `SELECT id, name, slug, description, price, stock, images, 
              created_at as createdAt, updated_at as updatedAt 
       FROM products WHERE id = @id`,
      { id }
    );
    return result;
  }

  // Find product by slug
  static async findBySlug(slug: string): Promise<Product | null> {
    const result = await executeQueryOne<Product>(
      `SELECT id, name, slug, description, price, stock, images, 
              created_at as createdAt, updated_at as updatedAt 
       FROM products WHERE slug = @slug`,
      { slug }
    );
    return result;
  }

  // Find all products
  static async findAll(): Promise<Product[]> {
    return await executeQuery<Product>(
      `SELECT id, name, slug, description, price, stock, images, 
              created_at as createdAt, updated_at as updatedAt 
       FROM products ORDER BY created_at DESC`
    );
  }

  // Create product
  static async create(productData: {
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images?: string | null;
  }): Promise<Product> {
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

    const product = await this.findById(result.id);
    if (!product) {
      throw new Error('Failed to retrieve created product');
    }
    return product;
  }

  // Update product
  static async update(id: number, updates: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    images: string | null;
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
    }
    if (updates.images !== undefined) {
      fields.push('images = @images');
      params.images = updates.images;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push('updated_at = GETDATE()');

    await executeNonQuery(
      `UPDATE products SET ${fields.join(', ')} WHERE id = @id`,
      params
    );

    return await this.findById(id);
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


