'use server';

import { z } from 'zod';
import { ProductReviewRepository } from '@/lib/repositories/ProductReviewRepository';
import { requireUser } from '@/lib/requireUser';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

// Validation schema
const createReviewSchema = z.object({
  productId: z.number().int().positive('Ürün ID gereklidir'),
  rating: z.number().int().min(1, 'Puan en az 1 olmalıdır').max(5, 'Puan en fazla 5 olabilir'),
  comment: z.string().min(10, 'Yorum en az 10 karakter olmalıdır').max(1000, 'Yorum en fazla 1000 karakter olabilir'),
});

/**
 * Submit product review
 */
export async function submitProductReview(formData: FormData): Promise<ActionResponse<{ id: number }>> {
  try {
    const user = await requireUser();

    const rawData = {
      productId: parseInt(formData.get('productId') as string, 10),
      rating: parseInt(formData.get('rating') as string, 10),
      comment: formData.get('comment') as string,
    };

    const validated = createReviewSchema.parse(rawData);

    // Check if user already reviewed this product
    const existingReview = await ProductReviewRepository.findByUserAndProduct(user.id, validated.productId);
    if (existingReview) {
      return {
        success: false,
        error: 'Bu ürün için zaten bir yorum yaptınız',
      };
    }

    const review = await ProductReviewRepository.create({
      userId: user.id,
      productId: validated.productId,
      rating: validated.rating,
      comment: validated.comment,
    });

    return {
      success: true,
      data: { id: review.id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    console.error('Submit review error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Yorum gönderilirken bir hata oluştu',
    };
  }
}

/**
 * Get reviews for a product
 */
export async function getProductReviews(productId: number, page: number = 1, limit: number = 10): Promise<ActionResponse<{
  reviews: Array<{
    id: number;
    userId: number;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
}>> {
  try {
    const reviews = await ProductReviewRepository.findByProductId(productId, page, limit);
    const total = await ProductReviewRepository.countByProductId(productId);

    return {
      success: true,
      data: {
        reviews: reviews.map(r => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName || 'Anonim',
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
        })),
        total,
        page,
        limit,
      },
    };
  } catch (error: any) {
    console.error('Get product reviews error:', error);
    return {
      success: false,
      error: error.message || 'Yorumlar yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get product rating
 */
export async function getProductRating(productId: number): Promise<ActionResponse<{
  average: number;
  count: number;
}>> {
  try {
    const rating = await ProductReviewRepository.getAverageRating(productId);
    const count = await ProductReviewRepository.countByProductId(productId);

    return {
      success: true,
      data: {
        average: rating || 0,
        count,
      },
    };
  } catch (error: any) {
    console.error('Get product rating error:', error);
    return {
      success: false,
      error: error.message || 'Ürün puanı yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get all reviews (admin)
 */
export async function getAllReviews(page: number = 1, limit: number = 20): Promise<ActionResponse<{
  reviews: Array<{
    id: number;
    productId: number;
    productName: string;
    userId: number;
    userName: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: Date;
  }>;
  total: number;
  page: number;
  limit: number;
}>> {
  try {
    await requireUser('ADMIN');
    const reviews = await ProductReviewRepository.findAll(page, limit);
    const total = await ProductReviewRepository.countAll();

    return {
      success: true,
      data: {
        reviews: reviews.map(r => ({
          id: r.id,
          productId: r.productId,
          productName: (r as any).productName || 'Bilinmeyen Ürün',
          userId: r.userId,
          userName: r.userName || 'Anonim',
          rating: r.rating,
          comment: r.comment || '',
          isApproved: r.isApproved,
          createdAt: r.createdAt,
        })),
        total,
        page,
        limit,
      },
    };
  } catch (error: any) {
    console.error('Get all reviews error:', error);
    return {
      success: false,
      error: error.message || 'Yorumlar yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Update review approval status (admin)
 */
export async function updateReviewApproval(reviewId: number, isApproved: boolean): Promise<ActionResponse> {
  try {
    await requireUser('ADMIN');

    const success = await ProductReviewRepository.updateApproval(reviewId, isApproved);
    if (!success) {
      return {
        success: false,
        error: 'Yorum bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Update review approval error:', error);
    return {
      success: false,
      error: error.message || 'Yorum durumu güncellenirken bir hata oluştu',
    };
  }
}

/**
 * Delete review (admin)
 */
export async function deleteReview(reviewId: number): Promise<ActionResponse> {
  try {
    await requireUser('ADMIN');

    const success = await ProductReviewRepository.delete(reviewId);
    if (!success) {
      return {
        success: false,
        error: 'Yorum bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete review error:', error);
    return {
      success: false,
      error: error.message || 'Yorum silinirken bir hata oluştu',
    };
  }
}
