'use client';

import { OrderStatus } from '@/lib/types/OrderStatus';
import { formatDateToTurkeyShort } from '@/lib/utils/dateFormatter';

interface StatusHistoryItem {
  id: number;
  orderId: number;
  adminUserId: number;
  oldStatus: OrderStatus | null;
  newStatus: OrderStatus;
  note: string | null;
  createdAt: Date;
}

interface UserOrderStatusTimelineProps {
  history: StatusHistoryItem[];
}

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
};

const statusIcons: Record<string, string> = {
  PENDING: '⏳',
  CONFIRMED: '✅',
  SHIPPED: '📦',
  DELIVERED: '🎉',
  CANCELLED: '❌',
};

export default function UserOrderStatusTimeline({ history }: UserOrderStatusTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Durumu</h2>
        <p className="text-gray-600 text-sm">Henüz durum bilgisi bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Durumu</h2>
      <div className="space-y-4">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;

          return (
            <div key={item.id} className="relative pl-8 pb-4">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-300" />
              )}
              
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                isLast ? 'bg-pink-600 border-pink-600 text-white' : 'bg-white border-gray-300'
              }`}>
                {statusIcons[item.newStatus] || '•'}
              </div>

              {/* Content */}
              <div className="ml-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    {statusLabels[item.newStatus] || item.newStatus}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDateToTurkeyShort(item.createdAt)}
                  </p>
                </div>
                
                {item.note && (
                  <p className="text-xs text-gray-600 mt-2 italic">
                    💬 {item.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

