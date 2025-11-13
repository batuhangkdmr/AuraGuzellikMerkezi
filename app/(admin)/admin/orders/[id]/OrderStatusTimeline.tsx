'use client';

import { OrderStatusHistoryWithAdmin } from '@/lib/repositories/OrderStatusHistoryRepository';
import { OrderStatus } from '@/lib/types/OrderStatus';
import { formatDateToTurkeyShort } from '@/lib/utils/dateFormatter';

interface OrderStatusTimelineProps {
  history: Array<OrderStatusHistoryWithAdmin | { id: number; orderId: number; adminUserId: number; oldStatus: OrderStatus | null; newStatus: OrderStatus; note: string | null; createdAt: Date }>;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
};

export default function OrderStatusTimeline({ history }: OrderStatusTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Durum Geçmişi</h2>
        <p className="text-gray-600 text-sm">Henüz durum geçmişi bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Durum Geçmişi</h2>
      <div className="space-y-4">
        {history.map((item, index) => {
          const isLast = index === history.length - 1;
          const hasAdminInfo = 'adminName' in item;

          return (
            <div key={item.id} className="relative pl-8 pb-4">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-300" />
              )}
              
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 ${
                isLast ? 'bg-pink-600 border-pink-600' : 'bg-white border-gray-300'
              }`} />

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
                
                {item.oldStatus && (
                  <p className="text-xs text-gray-600 mt-1">
                    {statusLabels[item.oldStatus] || item.oldStatus} → {statusLabels[item.newStatus] || item.newStatus}
                  </p>
                )}

                {hasAdminInfo && item.adminName && (
                  <p className="text-xs text-gray-500 mt-1">
                    👤 {item.adminName}
                  </p>
                )}

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

