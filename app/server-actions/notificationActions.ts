'use server';

import { NotificationRepository } from '@/lib/repositories/NotificationRepository';
import { requireUser } from '@/lib/requireUser';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Get user notifications
 */
export async function getUserNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<{
  notifications: Array<{
    id: number;
    type: string;
    title: string;
    message: string;
    dataJson: string | null;
    isRead: boolean;
    readAt: Date | null;
    createdAt: Date;
  }>;
  unreadCount: number;
}>> {
  try {
    const user = await requireUser();
    const notifications = await NotificationRepository.findByUserId(user.id, options);
    const unreadCount = await NotificationRepository.getUnreadCount(user.id);

    return {
      success: true,
      data: {
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          dataJson: n.dataJson,
          isRead: n.isRead,
          readAt: n.readAt,
          createdAt: n.createdAt,
        })),
        unreadCount,
      },
    };
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return {
      success: false,
      error: error.message || 'Bildirimler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number): Promise<ActionResponse> {
  try {
    const user = await requireUser();
    const success = await NotificationRepository.markAsRead(notificationId, user.id);

    if (!success) {
      return {
        success: false,
        error: 'Bildirim bulunamadı veya zaten okundu',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    return {
      success: false,
      error: error.message || 'Bildirim okundu olarak işaretlenirken bir hata oluştu',
    };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<ActionResponse<{ count: number }>> {
  try {
    const user = await requireUser();
    const count = await NotificationRepository.markAllAsRead(user.id);

    return {
      success: true,
      data: { count },
    };
  } catch (error: any) {
    console.error('Mark all as read error:', error);
    return {
      success: false,
      error: error.message || 'Bildirimler okundu olarak işaretlenirken bir hata oluştu',
    };
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: number): Promise<ActionResponse> {
  try {
    const user = await requireUser();
    const success = await NotificationRepository.delete(notificationId, user.id);

    if (!success) {
      return {
        success: false,
        error: 'Bildirim bulunamadı',
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return {
      success: false,
      error: error.message || 'Bildirim silinirken bir hata oluştu',
    };
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllReadNotifications(): Promise<ActionResponse<{ count: number }>> {
  try {
    const user = await requireUser();
    const count = await NotificationRepository.deleteAllRead(user.id);

    return {
      success: true,
      data: { count },
    };
  } catch (error: any) {
    console.error('Delete all read notifications error:', error);
    return {
      success: false,
      error: error.message || 'Bildirimler silinirken bir hata oluştu',
    };
  }
}

/**
 * Create notification (for admin or system use)
 */
export async function createNotification(data: {
  userId: number;
  type: 'ORDER' | 'STOCK' | 'CAMPAIGN' | 'PRICE' | 'REVIEW' | 'RETURN' | 'SYSTEM';
  title: string;
  message: string;
  dataJson?: Record<string, any>;
}): Promise<ActionResponse<{ id: number }>> {
  try {
    // Only admin can create notifications for other users
    // Regular users can only create notifications for themselves
    const currentUser = await requireUser();
    
    if (data.userId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Bu işlem için yetkiniz yok',
      };
    }

    const notification = await NotificationRepository.create(data);

    return {
      success: true,
      data: { id: notification.id },
    };
  } catch (error: any) {
    console.error('Create notification error:', error);
    return {
      success: false,
      error: error.message || 'Bildirim oluşturulurken bir hata oluştu',
    };
  }
}

