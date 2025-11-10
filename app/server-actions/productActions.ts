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
  images: z.array(z.string().url()).optional(),
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
 * Create product (admin only)
 */
export async function createProduct(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  try {
    // Require admin
    await requireUser('ADMIN');

    const rawData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string, 10),
      images: formData.get('images') ? JSON.parse(formData.get('images') as string) : [],
    };

    const validated = createProductSchema.parse(rawData);

    const product = await ProductRepository.create({
      name: validated.name,
      slug: validated.slug,
      description: validated.description,
      price: validated.price,
      stock: validated.stock,
      images: validated.images ? ProductRepository.stringifyImages(validated.images) : null,
    });

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

    const rawData: any = {};
    if (formData.get('name')) rawData.name = formData.get('name') as string;
    if (formData.get('slug')) rawData.slug = formData.get('slug') as string;
    if (formData.get('description')) rawData.description = formData.get('description') as string;
    if (formData.get('price')) rawData.price = parseFloat(formData.get('price') as string);
    if (formData.get('stock')) rawData.stock = parseInt(formData.get('stock') as string, 10);
    if (formData.get('images')) rawData.images = JSON.parse(formData.get('images') as string);

    const validated = updateProductSchema.parse(rawData);

    const updates: any = {};
    if (validated.name) updates.name = validated.name;
    if (validated.slug) updates.slug = validated.slug;
    if (validated.description) updates.description = validated.description;
    if (validated.price !== undefined) updates.price = validated.price;
    if (validated.stock !== undefined) updates.stock = validated.stock;
    if (validated.images !== undefined) {
      updates.images = ProductRepository.stringifyImages(validated.images);
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

