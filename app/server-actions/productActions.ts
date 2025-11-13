'use server';

import { z } from 'zod';
import { ProductRepository } from '@/lib/repositories/ProductRepository';
import { CategoryRepository } from '@/lib/repositories/CategoryRepository';
import { AttributeRepository } from '@/lib/repositories/AttributeRepository';
import { requireUser } from '@/lib/requireUser';
import { UserRole } from '@/lib/types/UserRole';

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Ürün adı gereklidir'),
  slug: z.string().min(1, 'Slug gereklidir').regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  description: z.string().min(1, 'Açıklama gereklidir'),
  price: z.number().positive('Fiyat pozitif olmalıdır'),
  stock: z.number().int().min(0, 'Stok negatif olamaz'),
  images: z.array(z.string().url()).default([]),
  primaryCategoryId: z.number().int().positive().nullable().optional(),
  categoryIds: z.array(z.number().int().positive()).default([]),
});

const updateProductSchema = createProductSchema.partial();

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Get all products (public - only active and in stock)
 * Optionally filter by category slug, search query, or attribute filters
 */
export async function getAllProducts(
  categorySlug?: string, 
  searchQuery?: string,
  attributeFilters?: Record<string, string[]> // attributeSlug -> valueSlug[]
) {
  try {
    let products = await ProductRepository.findAll(false); // Only active products
    
    // Filter by search query if provided
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query)
      );
    }
    
    // Filter by category if provided
    if (categorySlug) {
      // Find category by slug
      const category = await CategoryRepository.findBySlug(categorySlug, false);
      if (category) {
        // Get all category IDs (category and its children)
        const categoryIds: number[] = [category.id];
        
        // Get all children recursively
        const getChildrenIds = async (catId: number) => {
          const children = await CategoryRepository.findByParentId(catId, false);
          for (const child of children) {
            categoryIds.push(child.id);
            await getChildrenIds(child.id); // Recursive for grandchildren
          }
        };
        await getChildrenIds(category.id);
        
        // Get products that belong to any of these categories
        const productsWithCategories = await Promise.all(
          products.map(async (product) => {
            const productCategories = await CategoryRepository.findByProductId(product.id);
            return { product, categories: productCategories };
          })
        );
        
        // Filter products that have at least one matching category
        products = productsWithCategories
          .filter(({ categories }) => 
            categories.some(cat => categoryIds.includes(cat.id))
          )
          .map(({ product }) => product);
      }
    }

    // Filter by attribute values if provided
    if (attributeFilters && Object.keys(attributeFilters).length > 0) {
      // Get all attribute slugs and their value slugs
      const attributeSlugs = Object.keys(attributeFilters);
      
      // For each attribute, get the attribute ID and value IDs
      const attributeValueIds: number[] = [];
      
      for (const attrSlug of attributeSlugs) {
        const attribute = await AttributeRepository.findBySlug(attrSlug, false);
        if (!attribute) continue;
        
        const valueSlugs = attributeFilters[attrSlug];
        if (!valueSlugs || valueSlugs.length === 0) continue;
        
        // Get all values for this attribute
        const values = await AttributeRepository.getValuesByAttributeId(attribute.id, false);
        
        // Find matching value IDs
        const matchingValueIds = values
          .filter(v => valueSlugs.includes(v.slug))
          .map(v => v.id);
        
        attributeValueIds.push(...matchingValueIds);
      }
      
      if (attributeValueIds.length > 0) {
        // Filter products that have at least one of the selected attribute values
        // For multiple attributes, we need to ensure product has values from ALL attributes
        const productsWithAttributes = await Promise.all(
          products.map(async (product) => {
            const productAttributeValues = await AttributeRepository.getValuesByProductId(product.id);
            return { product, attributeValues: productAttributeValues };
          })
        );
        
        // Group attribute filters by attribute
        const filtersByAttribute: Record<number, number[]> = {};
        for (const attrSlug of attributeSlugs) {
          const attribute = await AttributeRepository.findBySlug(attrSlug, false);
          if (!attribute) continue;
          
          const valueSlugs = attributeFilters[attrSlug];
          if (!valueSlugs || valueSlugs.length === 0) continue;
          
          const values = await AttributeRepository.getValuesByAttributeId(attribute.id, false);
          const matchingValueIds = values
            .filter(v => valueSlugs.includes(v.slug))
            .map(v => v.id);
          
          if (matchingValueIds.length > 0) {
            filtersByAttribute[attribute.id] = matchingValueIds;
          }
        }
        
        // Filter products: product must have at least one value from each attribute filter
        products = productsWithAttributes
          .filter(({ attributeValues }) => {
            // For each attribute filter, check if product has at least one matching value
            for (const [attrId, requiredValueIds] of Object.entries(filtersByAttribute)) {
              const productValuesForAttribute = attributeValues.filter(
                av => av.attributeId === parseInt(attrId)
              );
              
              const hasMatchingValue = productValuesForAttribute.some(
                pv => requiredValueIds.includes(pv.id)
              );
              
              if (!hasMatchingValue) {
                return false; // Product doesn't have any value from this attribute filter
              }
            }
            return true; // Product has at least one value from each attribute filter
          })
          .map(({ product }) => product);
      }
    }
    
    return {
      success: true,
      data: products.map(p => ({
        ...p,
        images: ProductRepository.parseImages(p.images),
      })),
    };
  } catch (error) {
    console.error('Get products error:', error);
    return {
      success: false,
      error: 'Ürünler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get product by slug (public - only active and in stock)
 */
export async function getProductBySlug(slug: string) {
  try {
    const product = await ProductRepository.findBySlug(slug, false); // Only active products
    if (!product) {
      return {
        success: false,
        error: 'Ürün bulunamadı',
      };
    }
    return {
      success: true,
      data: {
        ...product,
        images: ProductRepository.parseImages(product.images),
      },
    };
  } catch (error) {
    console.error('Get product error:', error);
    return {
      success: false,
      error: 'Ürün yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get product by ID (admin can see inactive products)
 */
export async function getProductById(id: number) {
  try {
    // Admin can see inactive products, so include them
    const product = await ProductRepository.findById(id, true);
    if (!product) {
      return {
        success: false,
        error: 'Ürün bulunamadı',
      };
    }

    // Get product categories
    const categories = await CategoryRepository.findByProductId(id);

    // Get product attribute values
    const attributeValues = await AttributeRepository.getValuesByProductId(id);
    // Group by attributeId
    const attributeValuesByAttribute: Record<number, number[]> = {};
    attributeValues.forEach(value => {
      if (!attributeValuesByAttribute[value.attributeId]) {
        attributeValuesByAttribute[value.attributeId] = [];
      }
      attributeValuesByAttribute[value.attributeId].push(value.id);
    });

    return {
      success: true,
      data: {
        ...product,
        images: ProductRepository.parseImages(product.images),
        categories: categories,
        attributeValues: attributeValuesByAttribute,
      },
    };
  } catch (error) {
    console.error('Get product error:', error);
    return {
      success: false,
      error: 'Ürün yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Create product (admin only)
 */
export async function createProduct(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  try {
    // Require admin
    await requireUser('ADMIN');

    // Get images from formData
    const imagesData = formData.get('images');
    let imagesArray: string[] = [];
    
    if (imagesData) {
      try {
        const parsed = typeof imagesData === 'string' 
          ? JSON.parse(imagesData) 
          : imagesData;
        imagesArray = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Error parsing images JSON:', error, 'Raw data:', imagesData);
        imagesArray = [];
      }
    }

    // Get category IDs from formData (can be multiple)
    const categoryIdsData = formData.get('categoryIds');
    let categoryIds: number[] = [];
    if (categoryIdsData) {
      try {
        const parsed = typeof categoryIdsData === 'string' 
          ? JSON.parse(categoryIdsData) 
          : categoryIdsData;
        categoryIds = Array.isArray(parsed) ? parsed.map(id => parseInt(String(id), 10)) : [];
      } catch (error) {
        console.error('Error parsing categoryIds JSON:', error);
        categoryIds = [];
      }
    }

    // Get primary category ID
    const primaryCategoryIdValue = formData.get('primaryCategoryId');
    const primaryCategoryId = primaryCategoryIdValue && primaryCategoryIdValue !== '' && primaryCategoryIdValue !== 'null'
      ? parseInt(primaryCategoryIdValue as string, 10)
      : null;

    const rawData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string, 10),
      images: imagesArray.length > 0 ? imagesArray : [], // Ensure it's always an array
      primaryCategoryId: primaryCategoryId,
      categoryIds: categoryIds,
    };

    const validated = createProductSchema.parse(rawData);
    
    // Check if slug already exists
    const existingProduct = await ProductRepository.findBySlug(validated.slug);
    if (existingProduct) {
      return {
        success: false,
        error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.',
      };
    }

    // Convert images array to JSON string for database storage
    const imagesToSave = validated.images || [];
    const imagesJson = imagesToSave.length > 0
      ? ProductRepository.stringifyImages(imagesToSave)
      : null;

    // Create product
    const product = await ProductRepository.create({
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      price: validated.price,
      stock: validated.stock,
      images: imagesJson,
      primaryCategoryId: validated.primaryCategoryId || null,
    });

    // Set product categories (many-to-many relationship)
    if (validated.categoryIds && validated.categoryIds.length > 0) {
      await CategoryRepository.setProductCategories(product.id, validated.categoryIds);
    }

    // Get attribute values from formData
    const attributeValuesData = formData.get('attributeValues');
    if (attributeValuesData) {
      try {
        const parsed = typeof attributeValuesData === 'string' 
          ? JSON.parse(attributeValuesData) 
          : attributeValuesData;
        const attributeValues: Record<number, number[]> = typeof parsed === 'object' && parsed !== null ? parsed : {};
        
        // Set product attribute values
        await ProductRepository.setProductAttributeValues(product.id, attributeValues);
      } catch (error) {
        console.error('Error parsing attributeValues JSON:', error);
        // Don't fail the product creation if attribute values fail
      }
    }

    return {
      success: true,
      data: { id: product.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    
    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'number' in error && error.number === 2627) {
      return {
        success: false,
        error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.',
      };
    }
    
    console.error('Create product error:', error);
    return {
      success: false,
      error: 'Ürün oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Update product (admin only)
 */
export async function updateProduct(
  id: number,
  formData: FormData
): Promise<ActionResponse<{ id: number }>> {
  try {
    // Require admin
    await requireUser('ADMIN');

    // Get images from formData
    const imagesData = formData.get('images');
    let imagesArray: string[] = [];
    
    if (imagesData) {
      try {
        const parsed = typeof imagesData === 'string' 
          ? JSON.parse(imagesData) 
          : imagesData;
        imagesArray = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.error('Error parsing images JSON in updateProduct:', error, 'Raw data:', imagesData);
        imagesArray = [];
      }
    }

    // Get category IDs from formData (can be multiple)
    const categoryIdsData = formData.get('categoryIds');
    let categoryIds: number[] = [];
    if (categoryIdsData) {
      try {
        const parsed = typeof categoryIdsData === 'string' 
          ? JSON.parse(categoryIdsData) 
          : categoryIdsData;
        categoryIds = Array.isArray(parsed) ? parsed.map(catId => parseInt(String(catId), 10)) : [];
      } catch (error) {
        console.error('Error parsing categoryIds JSON:', error);
        categoryIds = [];
      }
    }

    // Get primary category ID
    const primaryCategoryIdValue = formData.get('primaryCategoryId');
    const primaryCategoryId = primaryCategoryIdValue && primaryCategoryIdValue !== '' && primaryCategoryIdValue !== 'null'
      ? parseInt(primaryCategoryIdValue as string, 10)
      : null;

    const rawData: any = {};
    if (formData.get('name')) rawData.name = formData.get('name') as string;
    if (formData.get('slug')) rawData.slug = formData.get('slug') as string;
    if (formData.get('description')) rawData.description = formData.get('description') as string;
    if (formData.get('price')) rawData.price = parseFloat(formData.get('price') as string);
    if (formData.get('stock')) rawData.stock = parseInt(formData.get('stock') as string, 10);
    if (imagesArray.length > 0 || formData.get('images')) {
      rawData.images = imagesArray.length > 0 ? imagesArray : [];
    }
    if (primaryCategoryIdValue !== null) {
      rawData.primaryCategoryId = primaryCategoryId;
    }
    if (categoryIdsData !== null) {
      rawData.categoryIds = categoryIds;
    }

    const validated = updateProductSchema.parse(rawData);

    // Check if slug is being updated and if it already exists (excluding current product)
    if (validated.slug) {
      const existingProduct = await ProductRepository.findBySlug(validated.slug);
      if (existingProduct && existingProduct.id !== id) {
        return {
          success: false,
          error: 'Bu slug zaten başka bir ürün tarafından kullanılıyor. Lütfen farklı bir slug kullanın.',
        };
      }
    }

    const updates: any = {};
    if (validated.name) updates.name = validated.name;
    if (validated.slug) updates.slug = validated.slug;
    if (validated.description) updates.description = validated.description;
    if (validated.price !== undefined) updates.price = validated.price;
    if (validated.stock !== undefined) updates.stock = validated.stock;
    if (validated.images !== undefined) {
      const imagesToSave = validated.images || [];
      updates.images = imagesToSave.length > 0
        ? ProductRepository.stringifyImages(imagesToSave)
        : null;
    }
    if (validated.primaryCategoryId !== undefined) {
      updates.primaryCategoryId = validated.primaryCategoryId;
    }

    const product = await ProductRepository.update(id, updates);
    if (!product) {
      return {
        success: false,
        error: 'Ürün bulunamadı',
      };
    }

    // Update product categories (many-to-many relationship)
    if (validated.categoryIds !== undefined) {
      await CategoryRepository.setProductCategories(product.id, validated.categoryIds);
    }

    // Get attribute values from formData
    const attributeValuesData = formData.get('attributeValues');
    if (attributeValuesData !== null) {
      try {
        const parsed = typeof attributeValuesData === 'string' 
          ? JSON.parse(attributeValuesData) 
          : attributeValuesData;
        const attributeValues: Record<number, number[]> = typeof parsed === 'object' && parsed !== null ? parsed : {};
        
        // Set product attribute values (this will delete old ones and add new ones)
        await ProductRepository.setProductAttributeValues(product.id, attributeValues);
      } catch (error) {
        console.error('Error parsing attributeValues JSON:', error);
        // Don't fail the product update if attribute values fail
      }
    }

    return {
      success: true,
      data: { id: product.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    
    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'number' in error && error.number === 2627) {
      return {
        success: false,
        error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.',
      };
    }
    
    console.error('Update product error:', error);
    return {
      success: false,
      error: 'Ürün güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Delete product (admin only)
 */
export async function deleteProduct(id: number): Promise<ActionResponse> {
  try {
    // Require admin
    await requireUser('ADMIN');

    const deleted = await ProductRepository.delete(id);
    if (!deleted) {
      return {
        success: false,
        error: 'Ürün bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Delete product error:', error);
    return {
      success: false,
      error: 'Ürün silinirken bir hata oluştu',
    };
  }
}

/**
 * Toggle product active status (admin only)
 */
export async function toggleProductActive(id: number, isActive: boolean): Promise<ActionResponse> {
  try {
    // Require admin
    await requireUser('ADMIN');

    const updated = await ProductRepository.update(id, { isActive });
    if (!updated) {
      return {
        success: false,
        error: 'Ürün bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Toggle product active error:', error);
    return {
      success: false,
      error: 'Ürün durumu güncellenirken bir hata oluştu',
    };
  }
}
