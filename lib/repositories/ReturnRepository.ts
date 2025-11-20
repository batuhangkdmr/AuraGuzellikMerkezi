import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';

export type ReturnStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED';
export type ReturnRequestType = 'RETURN' | 'CANCELLATION';

export interface OrderReturn {
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  status: ReturnStatus;
  adminNote: string | null;
  refundAmount: number | null;
  createdAt: Date;
  updatedAt: Date;
  processedAt: Date | null;
  requestType: ReturnRequestType;
}

export interface ReturnItem {
  id: number;
  returnId: number;
  orderItemId: number;
  quantity: number;
  reason: string | null;
}

export interface OrderReturnWithItems extends OrderReturn {
  items: ReturnItem[];
}

function determineRequestType(items: ReturnItem[]): ReturnRequestType {
  return items && items.length > 0 ? 'RETURN' : 'CANCELLATION';
}

export class ReturnRepository {
  // Parse SQL Server date string to Date object
  private static parseSqlDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  private static mapReturnRecord(
    returnResult: any,
    items: ReturnItem[]
  ): OrderReturnWithItems {
    return {
      id: returnResult.id,
      orderId: returnResult.orderId,
      userId: returnResult.userId,
      reason: returnResult.reason,
      status: returnResult.status,
      adminNote: returnResult.adminNote,
      refundAmount: returnResult.refundAmount,
      createdAt: this.parseSqlDate(returnResult.createdAt)!,
      updatedAt: this.parseSqlDate(returnResult.updatedAt)!,
      processedAt: this.parseSqlDate(returnResult.processedAt),
      requestType: determineRequestType(items),
      items,
    };
  }

  // Find return by ID
  static async findById(id: number): Promise<OrderReturnWithItems | null> {
    const returnResult = await executeQueryOne<any>(
      `SELECT id, order_id as orderId, user_id as userId, reason, status, admin_note as adminNote,
              refund_amount as refundAmount,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
              CASE WHEN processed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), processed_at, 126) END as processedAt
       FROM order_returns 
       WHERE id = @id`,
      { id }
    );

    if (!returnResult) return null;

    const items = await executeQuery<any>(
      `SELECT id, return_id as returnId, order_item_id as orderItemId, quantity, reason
       FROM return_items 
       WHERE return_id = @returnId`,
      { returnId: id }
    );

    return this.mapReturnRecord(returnResult, items || []);
  }

  // Find returns by user ID
  static async findByUserId(userId: number): Promise<OrderReturnWithItems[]> {
    const returns = await executeQuery<any>(
      `SELECT id, order_id as orderId, user_id as userId, reason, status, admin_note as adminNote,
              refund_amount as refundAmount,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
              CASE WHEN processed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), processed_at, 126) END as processedAt
       FROM order_returns 
       WHERE user_id = @userId
       ORDER BY created_at DESC`,
      { userId }
    );

    const returnsWithItems: OrderReturnWithItems[] = [];

    for (const returnItem of returns) {
      const items = await executeQuery<any>(
        `SELECT id, return_id as returnId, order_item_id as orderItemId, quantity, reason
         FROM return_items 
         WHERE return_id = @returnId`,
        { returnId: returnItem.id }
      );

      returnsWithItems.push(this.mapReturnRecord(returnItem, items || []));
    }

    return returnsWithItems;
  }

  // Find returns by order ID
  static async findByOrderId(orderId: number): Promise<OrderReturnWithItems[]> {
    const returns = await executeQuery<any>(
      `SELECT id, order_id as orderId, user_id as userId, reason, status, admin_note as adminNote,
              refund_amount as refundAmount,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
              CASE WHEN processed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), processed_at, 126) END as processedAt
       FROM order_returns 
       WHERE order_id = @orderId
       ORDER BY created_at DESC`,
      { orderId }
    );

    const returnsWithItems: OrderReturnWithItems[] = [];

    for (const returnItem of returns) {
      const items = await executeQuery<any>(
        `SELECT id, return_id as returnId, order_item_id as orderItemId, quantity, reason
         FROM return_items 
         WHERE return_id = @returnId`,
        { returnId: returnItem.id }
      );

      returnsWithItems.push(this.mapReturnRecord(returnItem, items || []));
    }

    return returnsWithItems;
  }

  // Get all returns (admin)
  static async findAll(): Promise<OrderReturnWithItems[]> {
    const returns = await executeQuery<any>(
      `SELECT id, order_id as orderId, user_id as userId, reason, status, admin_note as adminNote,
              refund_amount as refundAmount,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
              CASE WHEN processed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), processed_at, 126) END as processedAt
       FROM order_returns 
       ORDER BY created_at DESC`,
      {}
    );

    const returnsWithItems: OrderReturnWithItems[] = [];

    for (const returnItem of returns) {
      const items = await executeQuery<any>(
        `SELECT id, return_id as returnId, order_item_id as orderItemId, quantity, reason
         FROM return_items 
         WHERE return_id = @returnId`,
        { returnId: returnItem.id }
      );

      returnsWithItems.push(this.mapReturnRecord(returnItem, items || []));
    }

    return returnsWithItems;
  }

  // Create return request
  static async create(returnData: {
    orderId: number;
    userId: number;
    reason: string;
    items?: Array<{
      orderItemId: number;
      quantity: number;
      reason?: string | null;
    }>;
    requestType?: ReturnRequestType;
  }): Promise<OrderReturnWithItems> {
    const items = returnData.items || [];
    const requestType =
      returnData.requestType ||
      (items && items.length > 0 ? 'RETURN' : 'CANCELLATION');

    if (requestType === 'RETURN' && items.length === 0) {
      throw new Error('İade talebi için en az bir ürün seçmelisiniz.');
    }

    // Create return
    const returnResult = await executeQueryOne<{ id: number }>(
      `INSERT INTO order_returns (order_id, user_id, reason, status, created_at, updated_at)
       OUTPUT INSERTED.id
       VALUES (@orderId, @userId, @reason, 'PENDING', GETDATE(), GETDATE())`,
      {
        orderId: returnData.orderId,
        userId: returnData.userId,
        reason: returnData.reason,
      }
    );

    if (!returnResult) {
      throw new Error('Return oluşturulamadı');
    }

    const returnId = returnResult.id;

    // Create return items only for product returns
    if (requestType === 'RETURN') {
      for (const item of items) {
        await executeNonQuery(
          `INSERT INTO return_items (return_id, order_item_id, quantity, reason)
           VALUES (@returnId, @orderItemId, @quantity, @reason)`,
          {
            returnId,
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            reason: item.reason || null,
          }
        );
      }
    }

    const createdReturn = await this.findById(returnId);
    if (!createdReturn) {
      throw new Error('Return oluşturulamadı');
    }

    return createdReturn;
  }

  // Update return status (admin)
  static async updateStatus(
    id: number,
    status: ReturnStatus,
    adminNote?: string | null,
    refundAmount?: number | null
  ): Promise<boolean> {
    const updates: string[] = ['status = @status', 'updated_at = GETDATE()'];
    const params: Record<string, any> = { id, status };

    if (adminNote !== undefined) {
      updates.push('admin_note = @adminNote');
      params.adminNote = adminNote;
    }

    if (refundAmount !== undefined) {
      updates.push('refund_amount = @refundAmount');
      params.refundAmount = refundAmount;
    }

    if (status === 'COMPLETED' || status === 'PROCESSING') {
      updates.push('processed_at = GETDATE()');
    }

    const result = await executeNonQuery(
      `UPDATE order_returns 
       SET ${updates.join(', ')}
       WHERE id = @id`,
      params
    );

    return result > 0;
  }

  // Delete return (admin or user if pending)
  static async delete(id: number): Promise<boolean> {
    const result = await executeNonQuery(
      `DELETE FROM order_returns WHERE id = @id`,
      { id }
    );

    return result > 0;
  }

  // Create auto log when order is cancelled
  static async createCancellationRecord(
    orderId: number,
    userId: number,
    initiatedBy: 'ADMIN' | 'USER'
  ): Promise<void> {
    // Avoid duplicate records
    const existing = await executeQueryOne<{ id: number }>(
      `SELECT TOP 1 id FROM order_returns 
       WHERE order_id = @orderId AND status IN ('APPROVED','COMPLETED')`,
      { orderId }
    );

    if (existing) {
      return;
    }

    const reason =
      initiatedBy === 'ADMIN'
        ? 'Sipariş yönetici tarafından iptal edildi.'
        : 'Sipariş kullanıcı tarafından iptal edildi.';

    const adminNote =
      initiatedBy === 'ADMIN'
        ? 'Admin panelinden iptal edildi.'
        : 'Kullanıcı kendi siparişini iptal etti.';

    await executeNonQuery(
      `INSERT INTO order_returns (order_id, user_id, reason, status, admin_note, refund_amount, created_at, updated_at, processed_at)
       VALUES (@orderId, @userId, @reason, 'APPROVED', @adminNote, NULL, GETDATE(), GETDATE(), GETDATE())`,
      {
        orderId,
        userId,
        reason,
        adminNote,
      }
    );
  }

  static async hasPendingCancellation(orderId: number, userId?: number): Promise<boolean> {
    const result = await executeQueryOne<{ id: number }>(
      `SELECT TOP 1 orr.id
       FROM order_returns orr
       WHERE orr.order_id = @orderId
         ${userId ? 'AND orr.user_id = @userId' : ''}
         AND orr.status IN ('PENDING', 'PROCESSING')
         AND NOT EXISTS (
           SELECT 1 FROM return_items ri WHERE ri.return_id = orr.id
         )
       ORDER BY orr.created_at DESC`,
      { orderId, userId }
    );
    return !!result;
  }

  static async findLatestCancellationRequest(orderId: number): Promise<OrderReturnWithItems | null> {
    const cancellation = await executeQueryOne<any>(
      `SELECT TOP 1 id, order_id as orderId, user_id as userId, reason, status, admin_note as adminNote,
              refund_amount as refundAmount,
              CONVERT(VARCHAR(23), created_at, 126) as createdAt,
              CONVERT(VARCHAR(23), updated_at, 126) as updatedAt,
              CASE WHEN processed_at IS NULL THEN NULL ELSE CONVERT(VARCHAR(23), processed_at, 126) END as processedAt
       FROM order_returns
       WHERE order_id = @orderId
         AND NOT EXISTS (SELECT 1 FROM return_items WHERE return_id = order_returns.id)
       ORDER BY created_at DESC`,
      { orderId }
    );

    if (!cancellation) {
      return null;
    }

    return this.mapReturnRecord(cancellation, []);
  }
}

