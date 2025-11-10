'use server';

import { z } from 'zod';
import { ProductRepository } from '@/lib/repositories/ProductRepository';
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
});

const updateProductSchema = createProductSchema.partial();

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Get all products (public)
 */
export async function getAllProducts() {
  try {
    const products = await ProductRepository.findAll();
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
 * Get product by slug (public)
 */
export async function getProductBySlug(slug: string) {
  try {
    const product = await ProductRepository.findBySlug(slug);
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
 * Get product by ID (public)
 */
export async function getProductById(id: number) {
  try {
    const product = await ProductRepository.findById(id);
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

    // Debug: Log received images
    console.log('Received images in createProduct:', imagesArray);
    console.log('Images data type:', typeof imagesData);
    console.log('Images data:', imagesData);

    const rawData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string, 10),
      images: imagesArray.length > 0 ? imagesArray : [], // Ensure it's always an array
    };

    const validated = createProductSchema.parse(rawData);
    
    // Debug: Log validated images
    console.log('Validated images:', validated.images);
    console.log('Validated images length:', validated.images?.length || 0);

    // Check if slug already exists
    const existingProduct = await ProductRepository.findBySlug(validated.slug);
    if (existingProduct) {
      return {
        success: false,
        error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.',
      };
    }

    // Convert images array to JSON string for database storage
    // Always save images, even if empty array (store as empty array JSON, not null)
    const imagesToSave = validated.images || [];
    const imagesJson = imagesToSave.length > 0
      ? ProductRepository.stringifyImages(imagesToSave)
      : null; // Store null if empty array (database allows null)

    // Debug: Log images JSON before saving
    console.log('Images to save:', imagesToSave);
    console.log('Images JSON to save:', imagesJson);

    const product = await ProductRepository.create({
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      price: validated.price,
      stock: validated.stock,
      images: imagesJson,
    });
    
    // Debug: Log created product
    console.log('Created product:', product);

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

    // Debug: Log received images
    console.log('Received images in updateProduct:', imagesArray);

    const rawData: any = {};
    if (formData.get('name')) rawData.name = formData.get('name') as string;
    if (formData.get('slug')) rawData.slug = formData.get('slug') as string;
    if (formData.get('description')) rawData.description = formData.get('description') as string;
    if (formData.get('price')) rawData.price = parseFloat(formData.get('price') as string);
    if (formData.get('stock')) rawData.stock = parseInt(formData.get('stock') as string, 10);
    if (imagesArray.length > 0 || formData.get('images')) {
      rawData.images = imagesArray.length > 0 ? imagesArray : [];
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
      console.log('Update images to save:', imagesToSave);
      console.log('Update images JSON:', updates.images);
    }

    const product = await ProductRepository.update(id, updates);
    if (!product) {
      return {
        success: false,
        error: 'Ürün bulunamadı',
      };
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

