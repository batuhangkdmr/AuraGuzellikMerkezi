'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestOrderCancellation } from '@/app/server-actions/returnActions';
import type { ReturnStatus } from '@/lib/repositories/ReturnRepository';

interface CancelOrderButtonProps {
  orderId: number;
  existingRequest?: {
    status: ReturnStatus;
    createdAt: string;
  } | null;
}

export default function CancelOrderButton({ orderId, existingRequest }: CancelOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const isPendingRequest = existingRequest && existingRequest.status === 'PENDING';

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await requestOrderCancellation(orderId, reason);

      if (result.success) {
        setSuccess('İptal talebiniz iletildi. Yönetici onayı bekleniyor.');
        setReason('');
        router.refresh();
      } else {
        setError(result.error || 'İptal talebi gönderilirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İptal talebi gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">İptal Talebi</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {existingRequest && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4 text-sm">
          {existingRequest.status === 'PENDING'
            ? 'İptal talebiniz inceleniyor.'
            : `Son iptal talebiniz ${existingRequest.status} durumundadır.`}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-4">
        Siparişinizi iptal etmek için talep oluşturabilirsiniz. Talebiniz yönetici tarafından onaylandığında sipariş iptal edilecek.
      </p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="İptal talebinizin nedeni (opsiyonel)"
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || isPendingRequest}
        className={`w-full px-4 py-2 rounded-md font-semibold transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {isPendingRequest ? 'Talep Bekliyor' : loading ? 'Gönderiliyor...' : 'İptal Talebi Gönder'}
      </button>

      <p className="text-xs text-gray-500 mt-3">
        İptal talebiniz onaylandığında bilgilendirileceksiniz. Talep onaylanana kadar siparişiniz aktif kalır.
      </p>
    </div>
  );
}

