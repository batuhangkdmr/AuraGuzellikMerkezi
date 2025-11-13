import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: 'text' | 'number' | 'color' | 'boolean';
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;
  slug: string;
  colorCode: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  productCount?: number; // Computed field for filter counts
}

export interface AttributeWithValues extends ProductAttribute {
  values: AttributeValue[];
}

export class AttributeRepository {
  // Parse date from SQL Server
  private static parseSqlDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    return new Date(normalized);
  }

  // Get all active attributes
  static async findAll(includeInactive: boolean = false): Promise<ProductAttribute[]> {
    const whereClause = includeInactive ? '' : 'WHERE is_active = 1';
    const results = await executeQuery<any>(
      `SELECT id, name, slug, type, display_order as displayOrder,
              is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM product_attributes ${whereClause}
       ORDER BY display_order ASC, name ASC`,
      {}
    );

    return results.map((item: any) => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
    }));
  }

  // Get attribute by slug
  static async findBySlug(slug: string, includeInactive: boolean = false): Promise<ProductAttribute | null> {
    const whereClause = includeInactive 
      ? 'WHERE slug = @slug' 
      : 'WHERE slug = @slug AND is_active = 1';
    const result = await executeQueryOne<any>(
      `SELECT id, name, slug, type, display_order as displayOrder,
              is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM product_attributes ${whereClause}`,
      { slug }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Get values for an attribute
  static async getValuesByAttributeId(
    attributeId: number, 
    includeInactive: boolean = false,
    includeProductCount: boolean = false
  ): Promise<AttributeValue[]> {
    const whereClause = includeInactive ? 'WHERE av.attribute_id = @attributeId' : 'WHERE av.attribute_id = @attributeId AND av.is_active = 1';
    
    let query = `
      SELECT av.id, av.attribute_id as attributeId, av.value, av.slug, 
             av.color_code as colorCode, av.display_order as displayOrder,
             av.is_active as isActive,
             CONVERT(VARCHAR(23), av.created_at, 126) as createdAt
    `;

    if (includeProductCount) {
      query += `,
             (SELECT COUNT(DISTINCT pav.product_id)
              FROM product_attribute_values pav
              INNER JOIN products p ON pav.product_id = p.id
              WHERE pav.attribute_value_id = av.id
                AND p.is_active = 1 AND p.stock > 0) as productCount
      `;
    } else {
      query += `, NULL as productCount`;
    }

    query += `
      FROM attribute_values av
      ${whereClause}
      ORDER BY av.display_order ASC, av.value ASC
    `;

    const results = await executeQuery<any>(query, { attributeId });

    return results.map((item: any) => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
      productCount: item.productCount ? parseInt(item.productCount, 10) : undefined,
    }));
  }

  // Get attribute with all its values
  static async getAttributeWithValues(
    attributeSlug: string,
    includeInactive: boolean = false,
    includeProductCount: boolean = false
  ): Promise<AttributeWithValues | null> {
    const attribute = await this.findBySlug(attributeSlug, includeInactive);
    if (!attribute) return null;

    const values = await this.getValuesByAttributeId(attribute.id, includeInactive, includeProductCount);

    return {
      ...attribute,
      values,
    };
  }

  // Get all attributes with their values (for filter sidebar)
  static async getAllAttributesWithValues(
    includeInactive: boolean = false,
    includeProductCount: boolean = false
  ): Promise<AttributeWithValues[]> {
    const attributes = await this.findAll(includeInactive);
    
    const attributesWithValues = await Promise.all(
      attributes.map(async (attr) => {
        const values = await this.getValuesByAttributeId(attr.id, includeInactive, includeProductCount);
        return {
          ...attr,
          values,
        };
      })
    );

    return attributesWithValues;
  }

  // Get attribute values for a product
  static async getValuesByProductId(productId: number): Promise<AttributeValue[]> {
    const results = await executeQuery<any>(
      `SELECT av.id, av.attribute_id as attributeId, av.value, av.slug, 
              av.color_code as colorCode, av.display_order as displayOrder,
              av.is_active as isActive,
              CONVERT(VARCHAR(23), av.created_at, 126) as createdAt
       FROM product_attribute_values pav
       INNER JOIN attribute_values av ON pav.attribute_value_id = av.id
       WHERE pav.product_id = @productId AND av.is_active = 1
       ORDER BY av.display_order ASC, av.value ASC`,
      { productId }
    );

    return results.map((item: any) => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
    }));
  }

  // Get all brands from products table
  static async getAllBrands(includeProductCount: boolean = false): Promise<Array<{ brand: string; count: number }>> {
    let query = `
      SELECT DISTINCT brand
      FROM products
      WHERE brand IS NOT NULL AND brand != ''
        AND is_active = 1 AND stock > 0
      ORDER BY brand ASC
    `;

    if (includeProductCount) {
      query = `
        SELECT brand, COUNT(*) as count
        FROM products
        WHERE brand IS NOT NULL AND brand != ''
          AND is_active = 1 AND stock > 0
        GROUP BY brand
        ORDER BY brand ASC
      `;
    }

    const results = await executeQuery<any>(query, {});

    if (includeProductCount) {
      return results.map((item: any) => ({
        brand: item.brand,
        count: parseInt(item.count, 10),
      }));
    } else {
      return results.map((item: any) => ({
        brand: item.brand,
        count: 0,
      }));
    }
  }

  // Get attribute by ID
  static async findById(id: number, includeInactive: boolean = false): Promise<ProductAttribute | null> {
    const whereClause = includeInactive ? 'WHERE id = @id' : 'WHERE id = @id AND is_active = 1';
    const result = await executeQueryOne<any>(
      `SELECT id, name, slug, type, display_order as displayOrder,
              is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM product_attributes ${whereClause}`,
      { id }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Create attribute
  static async create(data: {
    name: string;
    slug: string;
    type: 'text' | 'number' | 'color' | 'boolean';
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<ProductAttribute> {
    const result = await executeQueryOne<{ id: number }>(
      `INSERT INTO product_attributes (name, slug, type, display_order, is_active, created_at, updated_at)
       OUTPUT INSERTED.id
       VALUES (@name, @slug, @type, @displayOrder, @isActive, GETDATE(), GETDATE())`,
      {
        name: data.name,
        slug: data.slug,
        type: data.type,
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    );

    if (!result) {
      throw new Error('Failed to create attribute');
    }

    const attribute = await this.findById(result.id, true);
    if (!attribute) {
      throw new Error('Failed to retrieve created attribute');
    }

    return attribute;
  }

  // Update attribute
  static async update(id: number, updates: Partial<{
    name: string;
    slug: string;
    type: 'text' | 'number' | 'color' | 'boolean';
    displayOrder: number;
    isActive: boolean;
  }>): Promise<ProductAttribute> {
    const updateFields: string[] = [];
    const params: any = { id };

    if (updates.name !== undefined) {
      updateFields.push('name = @name');
      params.name = updates.name;
    }
    if (updates.slug !== undefined) {
      updateFields.push('slug = @slug');
      params.slug = updates.slug;
    }
    if (updates.type !== undefined) {
      updateFields.push('type = @type');
      params.type = updates.type;
    }
    if (updates.displayOrder !== undefined) {
      updateFields.push('display_order = @displayOrder');
      params.displayOrder = updates.displayOrder;
    }
    if (updates.isActive !== undefined) {
      updateFields.push('is_active = @isActive');
      params.isActive = updates.isActive;
    }

    if (updateFields.length === 0) {
      const attribute = await this.findById(id, true);
      if (!attribute) {
        throw new Error('Attribute not found');
      }
      return attribute;
    }

    updateFields.push('updated_at = GETDATE()');

    await executeNonQuery(
      `UPDATE product_attributes SET ${updateFields.join(', ')} WHERE id = @id`,
      params
    );

    const attribute = await this.findById(id, true);
    if (!attribute) {
      throw new Error('Failed to retrieve updated attribute');
    }

    return attribute;
  }

  // Delete attribute (cascade will delete values)
  static async delete(id: number): Promise<void> {
    await executeNonQuery(
      'DELETE FROM product_attributes WHERE id = @id',
      { id }
    );
  }

  // Get attribute value by ID
  static async findValueById(id: number, includeInactive: boolean = false): Promise<AttributeValue | null> {
    const whereClause = includeInactive ? 'WHERE id = @id' : 'WHERE id = @id AND is_active = 1';
    const result = await executeQueryOne<any>(
      `SELECT id, attribute_id as attributeId, value, slug, 
              color_code as colorCode, display_order as displayOrder,
              is_active as isActive,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt
       FROM attribute_values ${whereClause}`,
      { id }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
    };
  }

  // Create attribute value
  static async createValue(data: {
    attributeId: number;
    value: string;
    slug: string;
    colorCode?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<AttributeValue> {
    const result = await executeQueryOne<{ id: number }>(
      `INSERT INTO attribute_values (attribute_id, value, slug, color_code, display_order, is_active, created_at)
       OUTPUT INSERTED.id
       VALUES (@attributeId, @value, @slug, @colorCode, @displayOrder, @isActive, GETDATE())`,
      {
        attributeId: data.attributeId,
        value: data.value,
        slug: data.slug,
        colorCode: data.colorCode || null,
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      }
    );

    if (!result) {
      throw new Error('Failed to create attribute value');
    }

    const value = await this.findValueById(result.id, true);
    if (!value) {
      throw new Error('Failed to retrieve created attribute value');
    }

    return value;
  }

  // Update attribute value
  static async updateValue(id: number, updates: Partial<{
    value: string;
    slug: string;
    colorCode: string | null;
    displayOrder: number;
    isActive: boolean;
  }>): Promise<AttributeValue> {
    const updateFields: string[] = [];
    const params: any = { id };

    if (updates.value !== undefined) {
      updateFields.push('value = @value');
      params.value = updates.value;
    }
    if (updates.slug !== undefined) {
      updateFields.push('slug = @slug');
      params.slug = updates.slug;
    }
    if (updates.colorCode !== undefined) {
      updateFields.push('color_code = @colorCode');
      params.colorCode = updates.colorCode;
    }
    if (updates.displayOrder !== undefined) {
      updateFields.push('display_order = @displayOrder');
      params.displayOrder = updates.displayOrder;
    }
    if (updates.isActive !== undefined) {
      updateFields.push('is_active = @isActive');
      params.isActive = updates.isActive;
    }

    if (updateFields.length === 0) {
      const value = await this.findValueById(id, true);
      if (!value) {
        throw new Error('Attribute value not found');
      }
      return value;
    }

    await executeNonQuery(
      `UPDATE attribute_values SET ${updateFields.join(', ')} WHERE id = @id`,
      params
    );

    const value = await this.findValueById(id, true);
    if (!value) {
      throw new Error('Failed to retrieve updated attribute value');
    }

    return value;
  }

  // Delete attribute value
  static async deleteValue(id: number): Promise<void> {
    await executeNonQuery(
      'DELETE FROM attribute_values WHERE id = @id',
      { id }
    );
  }
}

