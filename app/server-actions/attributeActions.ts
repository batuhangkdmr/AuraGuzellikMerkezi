'use server';

import { z } from 'zod';
import { AttributeRepository } from '@/lib/repositories/AttributeRepository';
import { requireUser } from '@/lib/requireUser';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// Validation schemas
const createAttributeSchema = z.object({
  name: z.string().min(1, 'Özellik adı gereklidir'),
  slug: z.string().min(1, 'Slug gereklidir').regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  type: z.enum(['text', 'number', 'color', 'boolean']),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const updateAttributeSchema = createAttributeSchema.partial();

const createAttributeValueSchema = z.object({
  attributeId: z.number().int().positive(),
  value: z.string().min(1, 'Değer gereklidir'),
  slug: z.string().min(1, 'Slug gereklidir').regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  colorCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const updateAttributeValueSchema = createAttributeValueSchema.partial().extend({
  attributeId: z.number().int().positive().optional(),
});

/**
 * Get all attributes with values (for filter sidebar)
 */
export async function getAllAttributesWithValues(includeProductCount: boolean = false) {
  try {
    const attributes = await AttributeRepository.getAllAttributesWithValues(false, includeProductCount);
    return {
      success: true,
      data: attributes,
    };
  } catch (error) {
    console.error('Get attributes error:', error);
    return {
      success: false,
      error: 'Özellikler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get all attributes (admin - includes inactive)
 */
export async function getAllAttributes(includeInactive: boolean = true) {
  try {
    await requireUser();
    const attributes = await AttributeRepository.findAll(includeInactive);
    return {
      success: true,
      data: attributes,
    };
  } catch (error) {
    console.error('Get attributes error:', error);
    return {
      success: false,
      error: 'Özellikler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get attribute by ID
 */
export async function getAttributeById(id: number) {
  try {
    await requireUser();
    const attribute = await AttributeRepository.findById(id, true);
    if (!attribute) {
      return {
        success: false,
        error: 'Özellik bulunamadı',
      };
    }
    
    const values = await AttributeRepository.getValuesByAttributeId(attribute.id, true);
    
    return {
      success: true,
      data: {
        ...attribute,
        values,
      },
    };
  } catch (error) {
    console.error('Get attribute error:', error);
    return {
      success: false,
      error: 'Özellik yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Create attribute
 */
export async function createAttribute(formData: FormData) {
  try {
    await requireUser();
    
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      type: formData.get('type') as 'text' | 'number' | 'color' | 'boolean',
      displayOrder: formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string) : undefined,
      isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    };

    const validated = createAttributeSchema.parse(data);
    const attribute = await AttributeRepository.create(validated);

    return {
      success: true,
      data: attribute,
    };
  } catch (error: any) {
    console.error('Create attribute error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: error.message || 'Özellik oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Update attribute
 */
export async function updateAttribute(id: number, formData: FormData) {
  try {
    await requireUser();
    
    const data: any = {};
    if (formData.get('name')) data.name = formData.get('name') as string;
    if (formData.get('slug')) data.slug = formData.get('slug') as string;
    if (formData.get('type')) data.type = formData.get('type') as 'text' | 'number' | 'color' | 'boolean';
    if (formData.get('displayOrder')) data.displayOrder = parseInt(formData.get('displayOrder') as string);
    if (formData.get('isActive') !== null) {
      data.isActive = formData.get('isActive') === 'true' || formData.get('isActive') === 'on';
    }

    const validated = updateAttributeSchema.parse(data);
    const attribute = await AttributeRepository.update(id, validated);

    return {
      success: true,
      data: attribute,
    };
  } catch (error: any) {
    console.error('Update attribute error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: error.message || 'Özellik güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Delete attribute
 */
export async function deleteAttribute(id: number) {
  try {
    await requireUser();
    await AttributeRepository.delete(id);
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete attribute error:', error);
    return {
      success: false,
      error: error.message || 'Özellik silinirken bir hata oluştu',
    };
  }
}

/**
 * Create attribute value
 */
export async function createAttributeValue(formData: FormData) {
  try {
    await requireUser();
    
    const data = {
      attributeId: parseInt(formData.get('attributeId') as string),
      value: formData.get('value') as string,
      slug: formData.get('slug') as string,
      colorCode: formData.get('colorCode') as string | null,
      displayOrder: formData.get('displayOrder') ? parseInt(formData.get('displayOrder') as string) : undefined,
      isActive: formData.get('isActive') === 'true' || formData.get('isActive') === 'on',
    };

    const validated = createAttributeValueSchema.parse(data);
    const value = await AttributeRepository.createValue(validated);

    return {
      success: true,
      data: value,
    };
  } catch (error: any) {
    console.error('Create attribute value error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: error.message || 'Özellik değeri oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Update attribute value
 */
export async function updateAttributeValue(id: number, formData: FormData) {
  try {
    await requireUser();
    
    const data: any = {};
    if (formData.get('value')) data.value = formData.get('value') as string;
    if (formData.get('slug')) data.slug = formData.get('slug') as string;
    if (formData.get('colorCode') !== null) {
      const colorCode = formData.get('colorCode') as string;
      data.colorCode = colorCode || null;
    }
    if (formData.get('displayOrder')) data.displayOrder = parseInt(formData.get('displayOrder') as string);
    if (formData.get('isActive') !== null) {
      data.isActive = formData.get('isActive') === 'true' || formData.get('isActive') === 'on';
    }

    const validated = updateAttributeValueSchema.parse(data);
    const value = await AttributeRepository.updateValue(id, validated);

    return {
      success: true,
      data: value,
    };
  } catch (error: any) {
    console.error('Update attribute value error:', error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    return {
      success: false,
      error: error.message || 'Özellik değeri güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Delete attribute value
 */
export async function deleteAttributeValue(id: number) {
  try {
    await requireUser();
    await AttributeRepository.deleteValue(id);
    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete attribute value error:', error);
    return {
      success: false,
      error: error.message || 'Özellik değeri silinirken bir hata oluştu',
    };
  }
}

/**
 * Get all brands
 */
export async function getAllBrands(includeProductCount: boolean = false) {
  try {
    const brands = await AttributeRepository.getAllBrands(includeProductCount);
    return {
      success: true,
      data: brands,
    };
  } catch (error) {
    console.error('Get brands error:', error);
    return {
      success: false,
      error: 'Markalar yüklenirken bir hata oluştu',
    };
  }
}

