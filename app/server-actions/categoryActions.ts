'use server';

import { z } from 'zod';
import { CategoryRepository } from '@/lib/repositories/CategoryRepository';
import { requireUser } from '@/lib/requireUser';

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'Kategori adı gereklidir'),
  slug: z.string().min(1, 'Slug gereklidir').regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  parentId: z.number().nullable().optional(),
  image: z.string().url().nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Get all categories (hierarchical tree)
 */
export async function getCategoryTree(includeInactive: boolean = false) {
  try {
    const categories = await CategoryRepository.findCategoryTree(includeInactive);
    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Get category tree error:', error);
    return {
      success: false,
      error: 'Kategoriler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get all main categories
 */
export async function getMainCategories(includeInactive: boolean = false) {
  try {
    const categories = await CategoryRepository.findMainCategories(includeInactive);
    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Get main categories error:', error);
    return {
      success: false,
      error: 'Kategoriler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: number, includeInactive: boolean = false) {
  try {
    const category = await CategoryRepository.findById(id, includeInactive);
    if (!category) {
      return {
        success: false,
        error: 'Kategori bulunamadı',
      };
    }
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error('Get category error:', error);
    return {
      success: false,
      error: 'Kategori yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get subcategories by parent ID
 */
export async function getSubcategoriesByParentId(parentId: number, includeInactive: boolean = false) {
  try {
    const categories = await CategoryRepository.findByParentId(parentId, includeInactive);
    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Get subcategories error:', error);
    return {
      success: false,
      error: 'Alt kategoriler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Create category (admin only)
 */
export async function createCategory(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  try {
    await requireUser('ADMIN');

    const parentIdValue = formData.get('parentId');
    const imageValue = formData.get('image');
    const displayOrderValue = formData.get('displayOrder');
    const isActiveValue = formData.get('isActive');

    const rawData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      parentId: parentIdValue && parentIdValue !== '' && parentIdValue !== 'null' 
        ? parseInt(parentIdValue as string, 10) 
        : null,
      image: imageValue && imageValue !== '' ? (imageValue as string) : null,
      displayOrder: displayOrderValue ? parseInt(displayOrderValue as string, 10) : 0,
      isActive: isActiveValue === 'true' || isActiveValue === '1' || isActiveValue === 'on',
    };

    const validated = createCategorySchema.parse(rawData);

    // Check if slug already exists
    const existingCategory = await CategoryRepository.findBySlug(validated.slug, true);
    if (existingCategory) {
      return {
        success: false,
        error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.',
      };
    }

    // Check if parent exists (if parentId is provided)
    if (validated.parentId) {
      const parent = await CategoryRepository.findById(validated.parentId, true);
      if (!parent) {
        return {
          success: false,
          error: 'Üst kategori bulunamadı',
        };
      }
    }

    const category = await CategoryRepository.create(validated);

    return {
      success: true,
      data: { id: category.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    if (error && typeof error === 'object' && 'number' in error && error.number === 2627) {
      return {
        success: false,
        error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.',
      };
    }

    console.error('Create category error:', error);
    return {
      success: false,
      error: 'Kategori oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Update category (admin only)
 */
export async function updateCategory(
  id: number,
  formData: FormData
): Promise<ActionResponse<{ id: number }>> {
  try {
    await requireUser('ADMIN');

    const nameValue = formData.get('name');
    const slugValue = formData.get('slug');
    const parentIdValue = formData.get('parentId');
    const imageValue = formData.get('image');
    const displayOrderValue = formData.get('displayOrder');
    const isActiveValue = formData.get('isActive');

    const rawData: any = {};
    if (nameValue) rawData.name = nameValue as string;
    if (slugValue) rawData.slug = slugValue as string;
    if (parentIdValue !== null) {
      const parentId = parentIdValue as string;
      rawData.parentId = parentId === 'null' || parentId === '' ? null : parseInt(parentId, 10);
    }
    // Image can be empty string to remove it
    if (imageValue !== null) {
      rawData.image = imageValue && imageValue !== '' ? (imageValue as string) : null;
    }
    if (displayOrderValue) rawData.displayOrder = parseInt(displayOrderValue as string, 10);
    if (isActiveValue !== null) {
      rawData.isActive = isActiveValue === 'true' || isActiveValue === '1' || isActiveValue === 'on';
    }

    const validated = updateCategorySchema.parse(rawData);

    // Check if slug is being updated and if it already exists (excluding current category)
    if (validated.slug) {
      const existingCategory = await CategoryRepository.findBySlug(validated.slug, true);
      if (existingCategory && existingCategory.id !== id) {
        return {
          success: false,
          error: 'Bu slug zaten başka bir kategori tarafından kullanılıyor. Lütfen farklı bir slug kullanın.',
        };
      }
    }

    // Check if parent exists (if parentId is provided)
    if (validated.parentId !== undefined && validated.parentId !== null) {
      const parent = await CategoryRepository.findById(validated.parentId, true);
      if (!parent) {
        return {
          success: false,
          error: 'Üst kategori bulunamadı',
        };
      }
      // Prevent circular reference (category cannot be its own parent)
      if (validated.parentId === id) {
        return {
          success: false,
          error: 'Bir kategori kendisinin üst kategorisi olamaz',
        };
      }
    }

    const category = await CategoryRepository.update(id, validated);
    if (!category) {
      return {
        success: false,
        error: 'Kategori bulunamadı',
      };
    }

    return {
      success: true,
      data: { id: category.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    if (error && typeof error === 'object' && 'number' in error && error.number === 2627) {
      return {
        success: false,
        error: 'Bu slug zaten kullanılıyor. Lütfen farklı bir slug kullanın.',
      };
    }

    console.error('Update category error:', error);
    return {
      success: false,
      error: 'Kategori güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Delete category (admin only)
 */
export async function deleteCategory(id: number): Promise<ActionResponse> {
  try {
    await requireUser('ADMIN');

    const deleted = await CategoryRepository.delete(id);
    if (!deleted) {
      return {
        success: false,
        error: 'Kategori bulunamadı veya silinemez (alt kategorileri var)',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete category error:', error);
    return {
      success: false,
      error: error.message || 'Kategori silinirken bir hata oluştu',
    };
  }
}

/**
 * Toggle category active status (admin only)
 */
export async function toggleCategoryActive(id: number, isActive: boolean): Promise<ActionResponse> {
  try {
    await requireUser('ADMIN');

    const updated = await CategoryRepository.update(id, { isActive });
    if (!updated) {
      return {
        success: false,
        error: 'Kategori bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Toggle category active error:', error);
    return {
      success: false,
      error: 'Kategori durumu güncellenirken bir hata oluştu',
    };
  }
}

