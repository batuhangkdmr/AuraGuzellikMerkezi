import 'server-only';

import { executeQuery, executeQueryOne, executeNonQuery } from '../db';

export interface Notification {
  id: number;
  userId: number;
  type: 'ORDER' | 'STOCK' | 'CAMPAIGN' | 'PRICE' | 'REVIEW' | 'RETURN' | 'SYSTEM';
  title: string;
  message: string;
  dataJson: string | null; // JSON string
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface CreateNotificationDto {
  userId: number;
  type: Notification['type'];
  title: string;
  message: string;
  dataJson?: Record<string, any>;
}

export class NotificationRepository {
  /**
   * Create a new notification
   */
  static async create(data: CreateNotificationDto): Promise<Notification> {
    const dataJson = data.dataJson ? JSON.stringify(data.dataJson) : null;
    
    const result = await executeQueryOne<any>(
      `INSERT INTO notifications (user_id, type, title, message, data_json, is_read, created_at)
       OUTPUT INSERTED.id, INSERTED.user_id, INSERTED.type, INSERTED.title, INSERTED.message, 
              INSERTED.data_json, INSERTED.is_read, INSERTED.read_at, INSERTED.created_at
       VALUES (@userId, @type, @title, @message, @dataJson, 0, GETDATE())`,
      {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        dataJson,
      }
    );

    return this.mapToNotification(result);
  }

  /**
   * Get notifications for a user
   */
  static async findByUserId(
    userId: number,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<Notification[]> {
    let query = `
      SELECT id, user_id, type, title, message, data_json, is_read, read_at, created_at
      FROM notifications
      WHERE user_id = @userId
    `;

    if (options?.unreadOnly) {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC';

    if (options?.limit) {
      query += ` OFFSET ${options.offset || 0} ROWS FETCH NEXT ${options.limit} ROWS ONLY`;
    }

    const results = await executeQuery<any>(query, { userId });

    return results.map(this.mapToNotification);
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const result = await executeQueryOne<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = @userId AND is_read = 0`,
      { userId }
    );

    return result?.count || 0;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const result = await executeNonQuery(
      `UPDATE notifications
       SET is_read = 1, read_at = GETDATE()
       WHERE id = @notificationId AND user_id = @userId`,
      { notificationId, userId }
    );

    return result > 0;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number): Promise<number> {
    const result = await executeNonQuery(
      `UPDATE notifications
       SET is_read = 1, read_at = GETDATE()
       WHERE user_id = @userId AND is_read = 0`,
      { userId }
    );

    return result;
  }

  /**
   * Delete notification
   */
  static async delete(notificationId: number, userId: number): Promise<boolean> {
    const result = await executeNonQuery(
      `DELETE FROM notifications
       WHERE id = @notificationId AND user_id = @userId`,
      { notificationId, userId }
    );

    return result > 0;
  }

  /**
   * Delete all read notifications for a user
   */
  static async deleteAllRead(userId: number): Promise<number> {
    const result = await executeNonQuery(
      `DELETE FROM notifications
       WHERE user_id = @userId AND is_read = 1`,
      { userId }
    );

    return result;
  }

  /**
   * Map database result to Notification object
   */
  private static mapToNotification(result: any): Notification {
    return {
      id: result.id,
      userId: result.user_id,
      type: result.type,
      title: result.title,
      message: result.message,
      dataJson: result.data_json,
      isRead: result.is_read === 1 || result.is_read === true,
      readAt: result.read_at ? new Date(result.read_at) : null,
      createdAt: new Date(result.created_at),
    };
  }
}

