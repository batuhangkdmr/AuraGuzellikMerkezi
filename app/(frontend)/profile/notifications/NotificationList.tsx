'use client';

import { useState } from 'react';
import Link from 'next/link';
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllReadNotifications } from '@/app/server-actions/notificationActions';
import { showToast } from '@/components/ToastContainer';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  dataJson: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

interface NotificationListProps {
  initialNotifications: Notification[];
  unreadCount: number;
}

export default function NotificationList({ initialNotifications, unreadCount: initialUnreadCount }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date() })));
        setUnreadCount(0);
        showToast('Tüm bildirimler okundu olarak işaretlendi', 'success');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      const result = await deleteNotification(notificationId);
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        showToast('Bildirim silindi', 'success');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm('Tüm okunmuş bildirimleri silmek istediğinize emin misiniz?')) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteAllReadNotifications();
      if (result.success) {
        setNotifications(prev => prev.filter(n => !n.isRead));
        showToast(`${result.data?.count || 0} bildirim silindi`, 'success');
      }
    } catch (error) {
      console.error('Error deleting all read notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER':
        return '📦';
      case 'STOCK':
        return '📊';
      case 'CAMPAIGN':
        return '🎉';
      case 'PRICE':
        return '💰';
      case 'REVIEW':
        return '⭐';
      case 'RETURN':
        return '↩️';
      default:
        return '🔔';
    }
  };

  const getNotificationLink = (notification: Notification) => {
    if (!notification.dataJson) return '/profile';
    
    try {
      const data = JSON.parse(notification.dataJson);
      switch (notification.type) {
        case 'ORDER':
          return `/profile/orders/${data.orderId}`;
        case 'STOCK':
        case 'PRICE':
          return `/products/${data.productSlug || ''}`;
        case 'REVIEW':
          return `/products/${data.productSlug || ''}#reviews`;
        case 'RETURN':
          return `/profile/orders/${data.orderId}`;
        default:
          return '/profile';
      }
    } catch {
      return '/profile';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <div className="space-y-6">
      {/* Actions */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors disabled:opacity-50 text-sm font-semibold"
              >
                {loading ? 'İşleniyor...' : 'Tümünü Okundu İşaretle'}
              </button>
            )}
            {readNotifications.length > 0 && (
              <button
                onClick={handleDeleteAllRead}
                disabled={loading}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 text-sm font-semibold"
              >
                Okunmuşları Sil ({readNotifications.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Okunmamış ({unreadNotifications.length})</h2>
          <div className="space-y-3">
            {unreadNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                getIcon={getNotificationIcon}
                getLink={getNotificationLink}
              />
            ))}
          </div>
        </div>
      )}

      {/* Read Notifications */}
      {readNotifications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Okunmuş ({readNotifications.length})</h2>
          <div className="space-y-3">
            {readNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                getIcon={getNotificationIcon}
                getLink={getNotificationLink}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {notifications.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-600 text-lg mb-2">Henüz bildirim yok</p>
          <p className="text-gray-400 text-sm">Yeni bildirimler burada görünecek</p>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  getIcon,
  getLink,
}: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
  getIcon: (type: string) => string;
  getLink: (notification: Notification) => string;
}) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
      !notification.isRead 
        ? 'border-primary-blue bg-blue-50/30' 
        : 'border-gray-300'
    }`}>
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Link
              href={getLink(notification)}
              className="font-bold text-gray-900 hover:text-primary-blue transition-colors"
            >
              {notification.title}
            </Link>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-primary-blue rounded-full flex-shrink-0 mt-2"></span>
            )}
          </div>
          <p className="text-gray-600 mb-3">{notification.message}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <div className="flex items-center gap-2">
              {!notification.isRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs text-primary-blue hover:text-primary-blue-dark font-semibold"
                >
                  Okundu İşaretle
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="text-xs text-red-600 hover:text-red-700 font-semibold"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

