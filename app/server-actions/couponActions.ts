'use server';

import { z } from 'zod';
import { CouponRepository, DiscountType } from '@/lib/repositories/CouponRepository';
import { requireUser } from '@/lib/requireUser';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// Validation schema
const validateCouponSchema = z.object({
  code: z.string().min(1, 'Kupon kodu gereklidir'),
});

const createCouponSchema = z.object({
  code: z.string().min(1, 'Kupon kodu gereklidir').max(50, 'Kupon kodu en fazla 50 karakter olabilir'),
  description: z.string().max(500, 'Açıklama en fazla 500 karakter olabilir').optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.number().positive('İndirim değeri pozitif olmalıdır'),
  minPurchaseAmount: z.number().nonnegative().optional().nullable(),
  maxDiscountAmount: z.number().nonnegative().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
});

/**
 * Validate coupon code
 */
export async function validateCoupon(code: string, totalAmount: number): Promise<ActionResponse<{
  discountAmount: number;
  couponId: number;
}>> {
  try {
    const user = await requireUser();

    const validated = validateCouponSchema.parse({ code });

    const result = await CouponRepository.validateCoupon(validated.code, user.id, totalAmount);

    if (!result.valid || !result.coupon) {
      return {
        success: false,
        error: result.error || 'Kupon geçersiz',
      };
    }

    return {
      success: true,
      data: {
        discountAmount: result.discountAmount!,
        couponId: result.coupon.id,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Validate coupon error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Kupon doğrulanırken bir hata oluştu',
    };
  }
}

/**
 * Get all coupons (admin)
 */
export async function getAllCoupons(): Promise<ActionResponse<Array<{
  id: number;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
}>>> {
  try {
    await requireUser('ADMIN');
    const coupons = await CouponRepository.findAll(true);

    return {
      success: true,
      data: coupons,
    };
  } catch (error: any) {
    console.error('Get all coupons error:', error);
    return {
      success: false,
      error: error.message || 'Kuponlar yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Create coupon (admin)
 */
export async function createCoupon(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  try {
    await requireUser('ADMIN');

    const rawData = {
      code: formData.get('code') as string,
      description: formData.get('description') as string | null,
      discountType: formData.get('discountType') as DiscountType,
      discountValue: parseFloat(formData.get('discountValue') as string),
      minPurchaseAmount: formData.get('minPurchaseAmount') ? parseFloat(formData.get('minPurchaseAmount') as string) : null,
      maxDiscountAmount: formData.get('maxDiscountAmount') ? parseFloat(formData.get('maxDiscountAmount') as string) : null,
      usageLimit: formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string, 10) : null,
      validFrom: formData.get('validFrom') as string | undefined,
      validUntil: formData.get('validUntil') as string | null,
    };

    const validated = createCouponSchema.parse(rawData);

    const coupon = await CouponRepository.create({
      code: validated.code,
      description: validated.description || null,
      discountType: validated.discountType,
      discountValue: validated.discountValue,
      minPurchaseAmount: validated.minPurchaseAmount || null,
      maxDiscountAmount: validated.maxDiscountAmount || null,
      usageLimit: validated.usageLimit || null,
      validFrom: validated.validFrom ? new Date(validated.validFrom) : new Date(),
      validUntil: validated.validUntil ? new Date(validated.validUntil) : null,
    });

    return {
      success: true,
      data: { id: coupon.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Create coupon error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Kupon oluşturulurken bir hata oluştu',
    };
  }
}

/**
 * Update coupon (admin)
 */
export async function updateCoupon(id: number, formData: FormData): Promise<ActionResponse> {
  try {
    await requireUser('ADMIN');

    const updates: any = {};
    if (formData.get('code')) updates.code = formData.get('code') as string;
    if (formData.get('description') !== null) updates.description = formData.get('description') as string | null;
    if (formData.get('discountType')) updates.discountType = formData.get('discountType') as DiscountType;
    if (formData.get('discountValue')) updates.discountValue = parseFloat(formData.get('discountValue') as string);
    if (formData.get('minPurchaseAmount') !== null) {
      updates.minPurchaseAmount = formData.get('minPurchaseAmount') ? parseFloat(formData.get('minPurchaseAmount') as string) : null;
    }
    if (formData.get('maxDiscountAmount') !== null) {
      updates.maxDiscountAmount = formData.get('maxDiscountAmount') ? parseFloat(formData.get('maxDiscountAmount') as string) : null;
    }
    if (formData.get('usageLimit') !== null) {
      updates.usageLimit = formData.get('usageLimit') ? parseInt(formData.get('usageLimit') as string, 10) : null;
    }
    if (formData.get('isActive') !== null) {
      updates.isActive = formData.get('isActive') === 'true';
    }
    if (formData.get('validFrom')) updates.validFrom = new Date(formData.get('validFrom') as string);
    if (formData.get('validUntil') !== null) {
      updates.validUntil = formData.get('validUntil') ? new Date(formData.get('validUntil') as string) : null;
    }

    await CouponRepository.update(id, updates);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Update coupon error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Kupon güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Delete coupon (admin)
 */
export async function deleteCoupon(id: number): Promise<ActionResponse> {
  try {
    await requireUser('ADMIN');

    const success = await CouponRepository.delete(id);
    if (!success) {
      return {
        success: false,
        error: 'Kupon bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    return {
      success: false,
      error: error.message || 'Kupon silinirken bir hata oluştu',
    };
  }
}

