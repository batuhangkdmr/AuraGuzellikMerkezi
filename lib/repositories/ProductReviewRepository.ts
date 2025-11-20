import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  rating: number; // 1-5
  comment: string | null;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReviewWithUser extends ProductReview {
  userName: string;
  userEmail: string;
  productName?: string;
}

export class ProductReviewRepository {
  // Parse SQL Server date string to Date object
  private static parseSqlDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  // Find review by ID
  static async findById(id: number): Promise<ProductReview | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, product_id as productId, user_id as userId, rating, comment, 
              is_approved as isApproved,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM product_reviews 
       WHERE id = @id`,
      { id }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Find reviews by product ID (only approved)
  static async findByProductId(productId: number, includeUnapproved: boolean = false): Promise<ProductReviewWithUser[]> {
    const whereClause = includeUnapproved 
      ? 'WHERE product_id = @productId'
      : 'WHERE product_id = @productId AND is_approved = 1';

    const results = await executeQuery<any>(
      `SELECT r.id, r.product_id as productId, r.user_id as userId, r.rating, r.comment,
              r.is_approved as isApproved,
              CONVERT(VARCHAR(23), r.created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), r.updated_at, 126) as updatedAt,
              u.name as userName, u.email as userEmail
       FROM product_reviews r
       INNER JOIN users u ON r.user_id = u.id
       ${whereClause}
       ORDER BY r.created_at DESC`,
      { productId }
    );

    return results.map(item => ({
      id: item.id,
      productId: item.productId,
      userId: item.userId,
      rating: item.rating,
      comment: item.comment,
      isApproved: item.isApproved,
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
      userName: item.userName,
      userEmail: item.userEmail,
    }));
  }

  // Find review by user and product
  static async findByUserAndProduct(userId: number, productId: number): Promise<ProductReview | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, product_id as productId, user_id as userId, rating, comment,
              is_approved as isApproved,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt
       FROM product_reviews 
       WHERE user_id = @userId AND product_id = @productId`,
      { userId, productId }
    );

    if (!result) return null;

    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
      updatedAt: this.parseSqlDate(result.updatedAt)!,
    };
  }

  // Get average rating for a product
  static async getAverageRating(productId: number): Promise<{ average: number; count: number }> {
    const result = await executeQueryOne<{ average: number; count: number }>(
      `SELECT 
        CAST(AVG(CAST(rating AS FLOAT)) AS DECIMAL(3,2)) as average,
        COUNT(*) as count
       FROM product_reviews 
       WHERE product_id = @productId AND is_approved = 1`,
      { productId }
    );

    return result || { average: 0, count: 0 };
  }

  // Create review
  static async create(reviewData: {
    productId: number;
    userId: number;
    rating: number;
    comment?: string | null;
  }): Promise<ProductReview> {
    const result = await executeQueryOne<{ id: number }>(
      `INSERT INTO product_reviews (product_id, user_id, rating, comment, is_approved, created_at, updated_at)
       OUTPUT INSERTED.id
       VALUES (@productId, @userId, @rating, @comment, 0, GETDATE(), GETDATE())`,
      {
        productId: reviewData.productId,
        userId: reviewData.userId,
        rating: reviewData.rating,
        comment: reviewData.comment || null,
      }
    );

    if (!result) {
      throw new Error('Review oluşturulamadı');
    }

    const review = await this.findById(result.id);
    if (!review) {
      throw new Error('Review oluşturulamadı');
    }

    return review;
  }

  // Update review
  static async update(id: number, updates: {
    rating?: number;
    comment?: string | null;
  }): Promise<ProductReview | null> {
    const fields: string[] = [];
    const params: Record<string, any> = { id };

    if (updates.rating !== undefined) {
      fields.push('rating = @rating');
      params.rating = updates.rating;
    }

    if (updates.comment !== undefined) {
      fields.push('comment = @comment');
      params.comment = updates.comment;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push('updated_at = GETDATE()');

    await executeNonQuery(
      `UPDATE product_reviews 
       SET ${fields.join(', ')}
       WHERE id = @id`,
      params
    );

    return await this.findById(id);
  }

  // Approve review (admin only)
  static async approve(id: number): Promise<boolean> {
    const result = await executeNonQuery(
      `UPDATE product_reviews 
       SET is_approved = 1, updated_at = GETDATE()
       WHERE id = @id`,
      { id }
    );

    return result > 0;
  }

  // Update approval status
  static async updateApproval(id: number, isApproved: boolean): Promise<boolean> {
    const result = await executeNonQuery(
      `UPDATE product_reviews 
       SET is_approved = @isApproved, updated_at = GETDATE()
       WHERE id = @id`,
      { id, isApproved: isApproved ? 1 : 0 }
    );

    return result > 0;
  }

  // Count all reviews
  static async countAll(): Promise<number> {
    const result = await executeQueryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM product_reviews`,
      {}
    );

    return result?.count || 0;
  }

  // Reject/Delete review
  static async delete(id: number): Promise<boolean> {
    const result = await executeNonQuery(
      `DELETE FROM product_reviews WHERE id = @id`,
      { id }
    );

    return result > 0;
  }

  // Get all reviews (admin - includes unapproved) with pagination
  static async findAll(page: number = 1, limit: number = 20): Promise<ProductReviewWithUser[]> {
    const offset = (page - 1) * limit;

    const results = await executeQuery<any>(
      `SELECT r.id, r.product_id as productId, r.user_id as userId, r.rating, r.comment,
              r.is_approved as isApproved,
              CONVERT(VARCHAR(23), r.created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), r.updated_at, 126) as updatedAt,
              u.name as userName, u.email as userEmail,
              p.name as productName
       FROM product_reviews r
       INNER JOIN users u ON r.user_id = u.id
       INNER JOIN products p ON r.product_id = p.id
       ORDER BY r.created_at DESC
       OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
      { offset, limit }
    );

    return results.map(item => ({
      id: item.id,
      productId: item.productId,
      userId: item.userId,
      rating: item.rating,
      comment: item.comment,
      isApproved: item.isApproved,
      createdAt: this.parseSqlDate(item.createdAt)!,
      updatedAt: this.parseSqlDate(item.updatedAt)!,
      userName: item.userName,
      userEmail: item.userEmail,
      productName: item.productName,
    }));
  }
}

