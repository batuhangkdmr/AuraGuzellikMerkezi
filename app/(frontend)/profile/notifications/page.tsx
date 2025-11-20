import { requireUser } from '@/lib/requireUser';
import { getUserNotifications } from '@/app/server-actions/notificationActions';
import NotificationList from './NotificationList';

export default async function NotificationsPage() {
  const user = await requireUser();
  
  const notificationsResult = await getUserNotifications({ limit: 50 });
  const notifications = notificationsResult.success && notificationsResult.data 
    ? notificationsResult.data.notifications 
    : [];
  const unreadCount = notificationsResult.success && notificationsResult.data
    ? notificationsResult.data.unreadCount
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirimlerim</h1>
          <p className="text-gray-600">
            {unreadCount > 0 
              ? `${unreadCount} okunmamış bildiriminiz var`
              : 'Tüm bildirimleriniz okundu'
            }
          </p>
        </div>

        <NotificationList initialNotifications={notifications} unreadCount={unreadCount} />
      </div>
    </div>
  );
}

