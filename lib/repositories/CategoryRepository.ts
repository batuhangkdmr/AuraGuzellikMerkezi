import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields (optional, populated when needed)
  children?: Category[];
  parent?: Category;
  productCount?: number;
}

export class CategoryRepository {
  // Parse date from SQL Server (same as OrderRepository)
  private static parseSqlDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    return new Date(normalized);
  }

  // Find category by ID
  static async findById(id: number, includeInactive: boolean = false): Promise<Category | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, name, slug, parent_id as parentId, image, 
              display_order as displayOrder, is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM categories 
       WHERE id = @id ${includeInactive ? '' : 'AND is_active = 1'}`,
      { id }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Find category by slug
  static async findBySlug(slug: string, includeInactive: boolean = false): Promise<Category | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, name, slug, parent_id as parentId, image, 
              display_order as displayOrder, is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM categories 
       WHERE slug = @slug ${includeInactive ? '' : 'AND is_active = 1'}`,
      { slug }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Find all main categories (parent_id IS NULL)
  static async findMainCategories(includeInactive: boolean = false): Promise<Category[]> {
    const results = await executeQuery<any>(
      `SELECT id, name, slug, parent_id as parentId, image, 
              display_order as displayOrder, is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM categories 
       WHERE parent_id IS NULL ${includeInactive ? '' : 'AND is_active = 1'}
       ORDER BY display_order ASC, name ASC`
    );

    return results.map(item => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
    }));
  }

  // Find subcategories by parent ID
  static async findByParentId(parentId: number, includeInactive: boolean = false): Promise<Category[]> {
    const results = await executeQuery<any>(
      `SELECT id, name, slug, parent_id as parentId, image, 
              display_order as displayOrder, is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM categories 
       WHERE parent_id = @parentId ${includeInactive ? '' : 'AND is_active = 1'}
       ORDER BY display_order ASC, name ASC`,
      { parentId }
    );

    return results.map(item => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
    }));
  }

  // Find all categories (hierarchical structure)
  static async findAll(includeInactive: boolean = false): Promise<Category[]> {
    const results = await executeQuery<any>(
      `SELECT id, name, slug, parent_id as parentId, image, 
              display_order as displayOrder, is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM categories ${includeInactive ? '' : 'WHERE is_active = 1'}
       ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END ASC, display_order ASC, name ASC`
    );

    return results.map(item => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
    }));
  }

  // Build hierarchical category tree
  static async findCategoryTree(includeInactive: boolean = false): Promise<Category[]> {
    const allCategories = await this.findAll(includeInactive);
    
    // Create a map for quick lookup
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];

    // First pass: create all categories
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    allCategories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parentId === null) {
        rootCategories.push(category);
      } else {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(category);
        }
      }
    });

    return rootCategories;
  }

  // Create category
  static async create(data: {
    name: string;
    slug: string;
    parentId?: number | null;
    image?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<Category> {
    const result = await executeQueryOne<{ id: number }>(
      `INSERT INTO categories (name, slug, parent_id, image, display_order, is_active, created_at, updated_at)
       OUTPUT INSERTED.id
       VALUES (@name, @slug, @parentId, @image, @displayOrder, @isActive, GETDATE(), GETDATE())`,
      {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId || null,
        image: data.image || null,
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    );

    if (!result) {
      throw new Error('Failed to create category');
    }

    const category = await this.findById(result.id, true);
    if (!category) {
      throw new Error('Failed to retrieve created category');
    }

    return category;
  }

  // Update category
  static async update(id: number, updates: Partial<{
    name: string;
    slug: string;
    parentId: number | null;
    image: string | null;
    displayOrder: number;
    isActive: boolean;
  }>): Promise<Category | null> {
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
    if (updates.parentId !== undefined) {
      fields.push('parent_id = @parentId');
      params.parentId = updates.parentId;
    }
    if (updates.image !== undefined) {
      fields.push('image = @image');
      params.image = updates.image;
    }
    if (updates.displayOrder !== undefined) {
      fields.push('display_order = @displayOrder');
      params.displayOrder = updates.displayOrder;
    }
    if (updates.isActive !== undefined) {
      fields.push('is_active = @isActive');
      params.isActive = updates.isActive;
    }

    if (fields.length === 0) {
      return await this.findById(id, true);
    }

    fields.push('updated_at = GETDATE()');

    await executeNonQuery(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = @id`,
      params
    );

    return await this.findById(id, true);
  }

  // Delete category
  static async delete(id: number): Promise<boolean> {
    // Check if category has children
    const children = await this.findByParentId(id, true);
    if (children.length > 0) {
      throw new Error('Cannot delete category with subcategories. Please delete subcategories first.');
    }

    const rowsAffected = await executeNonQuery(
      'DELETE FROM categories WHERE id = @id',
      { id }
    );
    return rowsAffected > 0;
  }

  // Get categories for a product
  static async findByProductId(productId: number): Promise<Category[]> {
    const results = await executeQuery<any>(
      `SELECT c.id, c.name, c.slug, c.parent_id as parentId, c.image, 
              c.display_order as displayOrder, c.is_active as isActive,
              CONVERT(VARCHAR(23), c.created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), c.updated_at, 126) as updatedAt
       FROM categories c
       INNER JOIN product_categories pc ON c.id = pc.category_id
       WHERE pc.product_id = @productId AND c.is_active = 1
       ORDER BY c.display_order ASC, c.name ASC`,
      { productId }
    );

    return results.map(item => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
    }));
  }

  // Add category to product
  static async addCategoryToProduct(productId: number, categoryId: number): Promise<boolean> {
    try {
      await executeNonQuery(
        `INSERT INTO product_categories (product_id, category_id, created_at)
         VALUES (@productId, @categoryId, GETDATE())`,
        { productId, categoryId }
      );
      return true;
    } catch (error: any) {
      // If duplicate key error, return true (already exists)
      if (error?.number === 2627) {
        return true;
      }
      throw error;
    }
  }

  // Remove category from product
  static async removeCategoryFromProduct(productId: number, categoryId: number): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'DELETE FROM product_categories WHERE product_id = @productId AND category_id = @categoryId',
      { productId, categoryId }
    );
    return rowsAffected > 0;
  }

  // Set product categories (replace all)
  static async setProductCategories(productId: number, categoryIds: number[]): Promise<boolean> {
    // Start transaction by deleting all existing categories
    await executeNonQuery(
      'DELETE FROM product_categories WHERE product_id = @productId',
      { productId }
    );

    // Add new categories
    for (const categoryId of categoryIds) {
      await this.addCategoryToProduct(productId, categoryId);
    }

    return true;
  }

  // Get product count for category
  static async getProductCount(categoryId: number, includeInactive: boolean = false): Promise<number> {
    const result = await executeQueryOne<{ count: number }>(
      `SELECT COUNT(DISTINCT pc.product_id) as count
       FROM product_categories pc
       INNER JOIN products p ON pc.product_id = p.id
       WHERE pc.category_id = @categoryId
       ${includeInactive ? '' : 'AND p.is_active = 1 AND p.stock > 0'}`,
      { categoryId }
    );

    return result?.count || 0;
  }
}

