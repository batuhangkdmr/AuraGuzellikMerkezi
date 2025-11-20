import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';
import { OrderStatus } from '../types/OrderStatus';

export interface OrderStatusHistory {
  id: number;
  orderId: number;
  adminUserId: number;
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  note: string | null;
  createdAt: Date;
}

export interface OrderStatusHistoryWithAdmin extends OrderStatusHistory {
  adminName: string;
  adminEmail: string;
}

export class OrderStatusHistoryRepository {
  // Parse SQL Server date string to Date object (avoids timezone conversion)
  private static parseSqlDate(dateStr: string | null): Date | null {
    if (!dateStr) return null;
    // SQL Server CONVERT format 126 returns ISO 8601: "2025-11-11T22:12:25.843"
    // Parse as local time (no timezone conversion)
    const normalized = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    return new Date(normalized);
  }

  // Create status history record
  static async create(data: {
    orderId: number;
    adminUserId: number;
    oldStatus: OrderStatus | null;
    newStatus: OrderStatus;
    note?: string | null;
  }): Promise<OrderStatusHistory> {
    // Try with both new_status and status columns (for backward compatibility)
    // If status column exists, we need to provide a value for it
    try {
      const result = await executeQueryOne<{ id: number }>(
        `INSERT INTO order_status_history (order_id, admin_user_id, old_status, new_status, status, note, created_at)
         OUTPUT INSERTED.id
         VALUES (@orderId, @adminUserId, @oldStatus, @newStatus, @status, @note, GETDATE())`,
        {
          orderId: data.orderId,
          adminUserId: data.adminUserId,
          oldStatus: data.oldStatus || null,
          newStatus: data.newStatus,
          status: data.newStatus, // Also set status column with same value
          note: data.note || null,
        }
      );

      if (!result) {
        throw new Error('Failed to create order status history');
      }

      const history = await this.findById(result.id);
      if (!history) {
        throw new Error('Status history oluşturulamadı');
      }

      return history;
    } catch (error: any) {
      // If status column doesn't exist, try without it
      if (error.message?.includes('status') || error.message?.includes('Invalid column')) {
        try {
          const result = await executeQueryOne<{ id: number }>(
            `INSERT INTO order_status_history (order_id, admin_user_id, old_status, new_status, note, created_at)
             OUTPUT INSERTED.id
             VALUES (@orderId, @adminUserId, @oldStatus, @newStatus, @note, GETDATE())`,
            {
              orderId: data.orderId,
              adminUserId: data.adminUserId,
              oldStatus: data.oldStatus || null,
              newStatus: data.newStatus,
              note: data.note || null,
            }
          );

          if (!result) {
            throw new Error('Failed to create order status history');
          }

          const history = await this.findById(result.id);
          if (!history) {
            throw new Error('Status history oluşturulamadı');
          }

          return history;
        } catch (error2: any) {
          // If new_status doesn't exist either, try with old status column only
          if (error2.message?.includes('new_status') || error2.message?.includes('Invalid column')) {
            const result = await executeQueryOne<{ id: number }>(
              `INSERT INTO order_status_history (order_id, admin_user_id, old_status, status, note, created_at)
               OUTPUT INSERTED.id
               VALUES (@orderId, @adminUserId, @oldStatus, @status, @note, GETDATE())`,
              {
                orderId: data.orderId,
                adminUserId: data.adminUserId,
                oldStatus: data.oldStatus || null,
                status: data.newStatus, // Use newStatus value for old status column
                note: data.note || null,
              }
            );

            if (!result) {
              throw new Error('Failed to create order status history');
            }

            const history = await this.findById(result.id);
            if (!history) {
              throw new Error('Status history oluşturulamadı');
            }

            return history;
          } else {
            throw error2;
          }
        }
      } else {
        throw error;
      }
    }
  }

  // Find status history by ID
  static async findById(id: number): Promise<OrderStatusHistory | null> {
    const result = await executeQueryOne<any>(
      `SELECT id, order_id as orderId, admin_user_id as adminUserId, 
              old_status as oldStatus, new_status as newStatus, note, 
              CONVERT(VARCHAR(23), created_at, 126) as createdAt
       FROM order_status_history WHERE id = @id`,
      { id }
    );
    
    if (!result) return null;
    
    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
    };
  }

  // Find all status history for an order
  static async findByOrderId(orderId: number): Promise<OrderStatusHistory[]> {
    const results = await executeQuery<any>(
      `SELECT id, order_id as orderId, admin_user_id as adminUserId, 
              old_status as oldStatus, new_status as newStatus, note, 
              CONVERT(VARCHAR(23), created_at, 126) as createdAt
       FROM order_status_history 
       WHERE order_id = @orderId
       ORDER BY created_at ASC`,
      { orderId }
    );
    
    return results.map(item => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
    }));
  }

  // Find all status history for an order with admin information
  static async findByOrderIdWithAdmin(orderId: number): Promise<OrderStatusHistoryWithAdmin[]> {
    const results = await executeQuery<any>(
      `SELECT 
        h.id, 
        h.order_id as orderId, 
        h.admin_user_id as adminUserId, 
        h.old_status as oldStatus, 
        h.new_status as newStatus, 
        h.note, 
        CONVERT(VARCHAR(23), h.created_at, 126) as createdAt,
        u.name as adminName,
        u.email as adminEmail
       FROM order_status_history h
       INNER JOIN users u ON h.admin_user_id = u.id
       WHERE h.order_id = @orderId
       ORDER BY h.created_at ASC`,
      { orderId }
    );
    
    return results.map(item => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
    }));
  }

  // Find status history by admin user ID
  static async findByAdminUserId(adminUserId: number): Promise<OrderStatusHistory[]> {
    const results = await executeQuery<any>(
      `SELECT id, order_id as orderId, admin_user_id as adminUserId, 
              old_status as oldStatus, new_status as newStatus, note, 
              CONVERT(VARCHAR(23), created_at, 126) as createdAt
       FROM order_status_history 
       WHERE admin_user_id = @adminUserId
       ORDER BY created_at DESC`,
      { adminUserId }
    );
    
    return results.map(item => ({
      ...item,
      createdAt: this.parseSqlDate(item.createdAt)!,
    }));
  }

  // Get latest status history for an order
  static async findLatestByOrderId(orderId: number): Promise<OrderStatusHistory | null> {
    const result = await executeQueryOne<any>(
      `SELECT TOP 1 id, order_id as orderId, admin_user_id as adminUserId, 
              old_status as oldStatus, new_status as newStatus, note, 
              CONVERT(VARCHAR(23), created_at, 126) as createdAt
       FROM order_status_history 
       WHERE order_id = @orderId
       ORDER BY created_at DESC`,
      { orderId }
    );
    
    if (!result) return null;
    
    return {
      ...result,
      createdAt: this.parseSqlDate(result.createdAt)!,
    };
  }

  // Delete status history (usually not needed, but useful for cleanup)
  static async delete(id: number): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'DELETE FROM order_status_history WHERE id = @id',
      { id }
    );
    return rowsAffected > 0;
  }

  // Delete all status history for an order (usually not needed)
  static async deleteByOrderId(orderId: number): Promise<boolean> {
    const rowsAffected = await executeNonQuery(
      'DELETE FROM order_status_history WHERE order_id = @orderId',
      { orderId }
    );
    return rowsAffected > 0;
  }
}
