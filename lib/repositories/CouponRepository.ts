import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
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
  createdAt: Date;
  updatedAt: Date;
}

export class CouponRepository {
  // Parse SQL Server date string to Date object
  private static parseSqlDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  // Find coupon by code
  static async findByCode(code: string): Promise<Coupon | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, code, description, discount_type as discountType, discount_value as discountValue,
              min_purchase_amount as minPurchaseAmount, max_discount_amount as maxDiscountAmount,
              usage_limit as usageLimit, used_count as usedCount, is_active as isActive,
              CONVERT(VARCHAR(23), valid_from, 126) as validFrom,
              CONVERT(VARCHAR(23), valid_until, 126) as validUntil,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM coupons 
       WHERE code = @code`,
      { code: code.toUpperCase().trim() }
    );

    if (!result) return null;

    return {
      ...result,
      validFrom: this.parseSqlDate(result.validFrom)!,
      validUntil: this.parseSqlDate(result.validUntil),
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Find coupon by ID
  static async findById(id: number): Promise<Coupon | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, code, description, discount_type as discountType, discount_value as discountValue,
              min_purchase_amount as minPurchaseAmount, max_discount_amount as maxDiscountAmount,
              usage_limit as usageLimit, used_count as usedCount, is_active as isActive,
              CONVERT(VARCHAR(23), valid_from, 126) as validFrom,
              CONVERT(VARCHAR(23), valid_until, 126) as validUntil,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM coupons 
       WHERE id = @id`,
      { id }
    );

    if (!result) return null;

    return {
      ...result,
      validFrom: this.parseSqlDate(result.validFrom)!,
      validUntil: this.parseSqlDate(result.validUntil),
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Validate coupon (check if it's valid and can be used)
  static async validateCoupon(code: string, userId: number, totalAmount: number): Promise<{
    valid: boolean;
    coupon: Coupon | null;
    error?: string;
    discountAmount?: number;
  }> {
    const coupon = await this.findByCode(code);

    if (!coupon) {
      return {
        valid: false,
        coupon: null,
        error: 'Kupon kodu bulunamadı',
      };
    }

    if (!coupon.isActive) {
      return {
        valid: false,
        coupon,
        error: 'Bu kupon aktif değil',
      };
    }

    const now = new Date();
    if (coupon.validFrom > now) {
      return {
        valid: false,
        coupon,
        error: 'Bu kupon henüz geçerli değil',
      };
    }

    if (coupon.validUntil && coupon.validUntil < now) {
      return {
        valid: false,
        coupon,
        error: 'Bu kuponun süresi dolmuş',
      };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return {
        valid: false,
        coupon,
        error: 'Bu kuponun kullanım limiti dolmuş',
      };
    }

    if (coupon.minPurchaseAmount && totalAmount < coupon.minPurchaseAmount) {
      return {
        valid: false,
        coupon,
        error: `Bu kuponu kullanmak için minimum ${coupon.minPurchaseAmount.toFixed(2)} ₺ tutarında alışveriş yapmalısınız`,
      };
    }

    // Check if user already used this coupon
    const alreadyUsed = await executeQueryOne<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM coupon_usage 
       WHERE coupon_id = @couponId AND user_id = @userId`,
      { couponId: coupon.id, userId }
    );

    if (alreadyUsed && alreadyUsed.count > 0) {
      return {
        valid: false,
        coupon,
        error: 'Bu kuponu daha önce kullandınız',
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed total amount
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    return {
      valid: true,
      coupon,
      discountAmount,
    };
  }

  // Apply coupon (increment used count and create usage record)
  static async applyCoupon(couponId: number, userId: number, orderId: number | null): Promise<boolean> {
    try {
      // Increment used count
      await executeNonQuery(
        `UPDATE coupons 
         SET used_count = used_count + 1, updated_at = GETDATE()
         WHERE id = @couponId`,
        { couponId }
      );

      // Create usage record
      await executeNonQuery(
        `INSERT INTO coupon_usage (coupon_id, user_id, order_id, used_at)
         VALUES (@couponId, @userId, @orderId, GETDATE())`,
        { couponId, userId, orderId }
      );

      return true;
    } catch (error) {
      console.error('Apply coupon error:', error);
      return false;
    }
  }

  // Get all coupons (admin)
  static async findAll(includeInactive: boolean = false): Promise<Coupon[]> {
    const whereClause = includeInactive ? '' : 'WHERE is_active = 1';

    const results = await executeQuery<any>(
      `SELECT id, code, description, discount_type as discountType, discount_value as discountValue,
              min_purchase_amount as minPurchaseAmount, max_discount_amount as maxDiscountAmount,
              usage_limit as usageLimit, used_count as usedCount, is_active as isActive,
              CONVERT(VARCHAR(23), valid_from, 126) as validFrom,
              CONVERT(VARCHAR(23), valid_until, 126) as validUntil,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM coupons
       ${whereClause}
       ORDER BY created_at DESC`,
      {}
    );

    return results.map(item => ({
      ...item,
      validFrom: this.parseSqlDate(item.validFrom)!,
      validUntil: this.parseSqlDate(item.validUntil),
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
    }));
  }

  // Create coupon (admin)
  static async create(couponData: {
    code: string;
    description?: string | null;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount?: number | null;
    maxDiscountAmount?: number | null;
    usageLimit?: number | null;
    validFrom?: Date;
    validUntil?: Date | null;
  }): Promise<Coupon> {
    const result = await executeQueryOne<{ id: number }>(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, 
                           max_discount_amount, usage_limit, valid_from, valid_until, created_at, updated_at)
       OUTPUT INSERTED.id
       VALUES (@code, @description, @discountType, @discountValue, @minPurchaseAmount, 
               @maxDiscountAmount, @usageLimit, @validFrom, @validUntil, GETDATE(), GETDATE())`,
      {
        code: couponData.code.toUpperCase().trim(),
        description: couponData.description || null,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        minPurchaseAmount: couponData.minPurchaseAmount || null,
        maxDiscountAmount: couponData.maxDiscountAmount || null,
        usageLimit: couponData.usageLimit || null,
        validFrom: couponData.validFrom || new Date(),
        validUntil: couponData.validUntil || null,
      }
    );

    if (!result) {
      throw new Error('Coupon oluşturulamadı');
    }

    const coupon = await this.findById(result.id);
    if (!coupon) {
      throw new Error('Coupon oluşturulamadı');
    }

    return coupon;
  }

  // Update coupon (admin)
  static async update(id: number, updates: Partial<{
    code: string;
    description: string | null;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount: number | null;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    isActive: boolean;
    validFrom: Date;
    validUntil: Date | null;
  }>): Promise<Coupon | null> {
    const fields: string[] = [];
    const params: Record<string, any> = { id };

    if (updates.code !== undefined) {
      fields.push('code = @code');
      params.code = updates.code.toUpperCase().trim();
    }
    if (updates.description !== undefined) {
      fields.push('description = @description');
      params.description = updates.description;
    }
    if (updates.discountType !== undefined) {
      fields.push('discount_type = @discountType');
      params.discountType = updates.discountType;
    }
    if (updates.discountValue !== undefined) {
      fields.push('discount_value = @discountValue');
      params.discountValue = updates.discountValue;
    }
    if (updates.minPurchaseAmount !== undefined) {
      fields.push('min_purchase_amount = @minPurchaseAmount');
      params.minPurchaseAmount = updates.minPurchaseAmount;
    }
    if (updates.maxDiscountAmount !== undefined) {
      fields.push('max_discount_amount = @maxDiscountAmount');
      params.maxDiscountAmount = updates.maxDiscountAmount;
    }
    if (updates.usageLimit !== undefined) {
      fields.push('usage_limit = @usageLimit');
      params.usageLimit = updates.usageLimit;
    }
    if (updates.isActive !== undefined) {
      fields.push('is_active = @isActive');
      params.isActive = updates.isActive ? 1 : 0;
    }
    if (updates.validFrom !== undefined) {
      fields.push('valid_from = @validFrom');
      params.validFrom = updates.validFrom;
    }
    if (updates.validUntil !== undefined) {
      fields.push('valid_until = @validUntil');
      params.validUntil = updates.validUntil;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push('updated_at = GETDATE()');

    await executeNonQuery(
      `UPDATE coupons 
       SET ${fields.join(', ')}
       WHERE id = @id`,
      params
    );

    return await this.findById(id);
  }

  // Delete coupon (admin)
  static async delete(id: number): Promise<boolean> {
    const result = await executeNonQuery(
      `DELETE FROM coupons WHERE id = @id`,
      { id }
    );

    return result > 0;
  }
}

