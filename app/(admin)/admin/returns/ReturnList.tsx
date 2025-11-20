'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import { ReturnStatus } from '@/lib/repositories/ReturnRepository';

interface Return {
  id: number;
  orderId: number;
  userId: number;
  reason: string;
  status: ReturnStatus;
  adminNote: string | null;
  refundAmount: number | null;
  createdAt: Date;
  requestType: 'RETURN' | 'CANCELLATION';
}

interface ReturnListProps {
  initialReturns: Return[];
}

export default function ReturnList({ initialReturns }: ReturnListProps) {
  const [returns] = useState<Return[]>(initialReturns);

  const statusColors: Record<ReturnStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    APPROVED: 'bg-green-100 text-green-800 border-green-300',
    REJECTED: 'bg-red-100 text-red-800 border-red-300',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300',
    COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const statusLabels: Record<ReturnStatus, string> = {
    PENDING: 'Beklemede',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    PROCESSING: 'İşleniyor',
    COMPLETED: 'Tamamlandı',
  };

  if (returns.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-gray-200">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-600 text-lg font-semibold">Henüz iade talebi bulunmamaktadır</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Talep ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Sipariş ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kullanıcı ID</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tür</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Neden</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {returns.map((returnItem) => (
              <tr key={returnItem.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-900">#{returnItem.id}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/orders/${returnItem.orderId}`}
                    className="text-sm font-semibold text-primary-blue hover:text-primary-blue-dark"
                  >
                    #{returnItem.orderId}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/users/${returnItem.userId}`}
                    className="text-sm text-gray-700 hover:text-primary-blue"
                  >
                    #{returnItem.userId}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 bg-gray-100 text-gray-800 border-gray-200">
                    {returnItem.requestType === 'CANCELLATION' ? 'İptal Talebi' : 'İade'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 max-w-xs truncate">{returnItem.reason}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 ${statusColors[returnItem.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                    {statusLabels[returnItem.status] || returnItem.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {formatDateToTurkey(returnItem.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/returns/${returnItem.id}`}
                    className="px-3 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-all font-semibold text-xs"
                  >
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

