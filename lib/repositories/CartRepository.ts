import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery, executeTransaction, sql } from '../db';

export interface CartItem {
  id: number;
  userId: number | null;
  sessionId: string | null;
  productId: number;
  quantity: number;
  createdAt: Date;
  // Joined data
  productName?: string;
  productPrice?: number;
  productImages?: string | null;
}

export class CartRepository {
  // Get cart items for user
  static async findByUserId(userId: number): Promise<CartItem[]> {
    return await executeQuery<CartItem>(
      `SELECT ci.id, ci.user_id as userId, ci.session_id as sessionId, 
              ci.product_id as productId, ci.quantity, ci.created_at as createdAt,
              p.name as productName, p.price as productPrice, p.images as productImages
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = @userId
       ORDER BY ci.created_at DESC`,
      { userId }
    );
  }

  // Get cart items for guest (session)
  static async findBySessionId(sessionId: string): Promise<CartItem[]> {
    return await executeQuery<CartItem>(
      `SELECT ci.id, ci.user_id as userId, ci.session_id as sessionId, 
              ci.product_id as productId, ci.quantity, ci.created_at as createdAt,
              p.name as productName, p.price as productPrice, p.images as productImages
       FROM cart_items ci
       INNER JOIN products p ON ci.product_id = p.id
       WHERE ci.session_id = @sessionId
       ORDER BY ci.created_at DESC`,
      { sessionId }
    );
  }

  // Find cart item by user and product
  static async findByUserAndProduct(userId: number | null, sessionId: string | null, productId: number): Promise<CartItem | null> {
    if (userId) {
      return await executeQueryOne<CartItem>(
        'SELECT id, user_id as userId, session_id as sessionId, product_id as productId, quantity, created_at as createdAt FROM cart_items WHERE user_id = @userId AND product_id = @productId',
        { userId, productId }
      );
    } else if (sessionId) {
      return await executeQueryOne<CartItem>(
        'SELECT id, user_id as userId, session_id as sessionId, product_id as productId, quantity, created_at as createdAt FROM cart_items WHERE session_id = @sessionId AND product_id = @productId',
        { sessionId, productId }
      );
    }
    return null;
  }

  // Add item to cart
  static async addItem(data: {
    userId?: number | null;
    sessionId?: string | null;
    productId: number;
    quantity: number;
  }): Promise<CartItem> {
    // Check if item already exists
    const existing = await this.findByUserAndProduct(data.userId || null, data.sessionId || null, data.productId);
    
    if (existing) {
      // Update quantity
      const newQuantity = existing.quantity + data.quantity;
      await executeNonQuery(
        'UPDATE cart_items SET quantity = @quantity WHERE id = @id',
        { id: existing.id, quantity: newQuantity }
      );
      const updated = await executeQueryOne<CartItem>(
        'SELECT id, user_id as userId, session_id as sessionId, product_id as productId, quantity, created_at as createdAt FROM cart_items WHERE id = @id',
        { id: existing.id }
      );
      return updated!;
    } else {
      // Create new item
      const result = await executeQueryOne<{ id: number }>(
        `INSERT INTO cart_items (user_id, session_id, product_id, quantity, created_at)
         OUTPUT INSERTED.id
         VALUES (@userId, @sessionId, @productId, @quantity, GETDATE())`,
        {
          userId: data.userId || null,
          sessionId: data.sessionId || null,
          productId: data.productId,
          quantity: data.quantity,
        }
      );

      if (!result) {
        throw new Error('Failed to add item to cart');
      }

      const item = await executeQueryOne<CartItem>(
        'SELECT id, user_id as userId, session_id as sessionId, product_id as productId, quantity, created_at as createdAt FROM cart_items WHERE id = @id',
        { id: result.id }
      );
      
      if (!item) {
        throw new Error('Failed to retrieve cart item');
      }
      return item;
    }
  }

  // Update cart item quantity
  static async updateQuantity(id: number, quantity: number): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'UPDATE cart_items SET quantity = @quantity WHERE id = @id',
      { id, quantity }
    );
    return rowsAffected > 0;
  }

  // Remove item from cart
  static async removeItem(id: number): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'DELETE FROM cart_items WHERE id = @id',
      { id }
    );
    return rowsAffected > 0;
  }

  // Clear cart for user
  static async clearUserCart(userId: number): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'DELETE FROM cart_items WHERE user_id = @userId',
      { userId }
    );
    return rowsAffected >= 0;
  }

  // Clear cart for guest
  static async clearSessionCart(sessionId: string): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'DELETE FROM cart_items WHERE session_id = @sessionId',
      { sessionId }
    );
    return rowsAffected >= 0;
  }

  // Merge guest cart with user cart (when user logs in)
  static async mergeCarts(userId: number, sessionId: string): Promise<void> {
    await executeTransaction(async (transaction) => {
      const request = new sql.Request(transaction);
      
      // Get guest cart items
      request.input('sessionId', sql.VarChar, sessionId);
      const guestItems = await request.query(`
        SELECT product_id, quantity 
        FROM cart_items 
        WHERE session_id = @sessionId
      `);

      // For each guest item, merge with user cart
      for (const guestItem of guestItems.recordset) {
        const mergeRequest = new sql.Request(transaction);
        mergeRequest.input('userId', sql.Int, userId);
        mergeRequest.input('sessionId', sql.VarChar, sessionId);
        mergeRequest.input('productId', sql.Int, guestItem.product_id);
        mergeRequest.input('quantity', sql.Int, guestItem.quantity);

        // Check if user already has this product in cart
        const existing = await mergeRequest.query(`
          SELECT id, quantity 
          FROM cart_items 
          WHERE user_id = @userId AND product_id = @productId
        `);

        if (existing.recordset.length > 0) {
          // Update quantity
          const updateRequest = new sql.Request(transaction);
          updateRequest.input('id', sql.Int, existing.recordset[0].id);
          updateRequest.input('quantity', sql.Int, existing.recordset[0].quantity + guestItem.quantity);
          await updateRequest.query(`
            UPDATE cart_items 
            SET quantity = @quantity 
            WHERE id = @id
          `);
        } else {
          // Move item to user cart
          const moveRequest = new sql.Request(transaction);
          moveRequest.input('userId', sql.Int, userId);
          moveRequest.input('productId', sql.Int, guestItem.product_id);
          moveRequest.input('quantity', sql.Int, guestItem.quantity);
          await moveRequest.query(`
            UPDATE cart_items 
            SET user_id = @userId, session_id = NULL 
            WHERE session_id = @sessionId AND product_id = @productId
          `);
        }
      }

      // Delete any remaining guest items
      const deleteRequest = new sql.Request(transaction);
      deleteRequest.input('sessionId', sql.VarChar, sessionId);
      await deleteRequest.query(`
        DELETE FROM cart_items 
        WHERE session_id = @sessionId
      `);
    });
  }
}


