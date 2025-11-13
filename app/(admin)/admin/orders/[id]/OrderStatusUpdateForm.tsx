'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/app/server-actions/orderActions';
import { OrderStatus } from '@/lib/types/OrderStatus';

interface OrderStatusUpdateFormProps {
  orderId: number;
  currentStatus: OrderStatus;
  currentTrackingNumber: string | null;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: OrderStatus.PENDING, label: 'Beklemede' },
  { value: OrderStatus.CONFIRMED, label: 'Onaylandı' },
  { value: OrderStatus.SHIPPED, label: 'Kargoya Verildi' },
  { value: OrderStatus.DELIVERED, label: 'Teslim Edildi' },
  { value: OrderStatus.CANCELLED, label: 'İptal Edildi' },
];

export default function OrderStatusUpdateForm({
  orderId,
  currentStatus,
  currentTrackingNumber,
}: OrderStatusUpdateFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState<string>(currentTrackingNumber || '');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // If status is SHIPPED, tracking number is required
      if (status === OrderStatus.SHIPPED && !trackingNumber.trim()) {
        setError('Kargoya verildi durumu için kargo takip numarası gereklidir.');
        setLoading(false);
        return;
      }

      const result = await updateOrderStatus(
        orderId,
        status,
        status === OrderStatus.SHIPPED ? trackingNumber.trim() || null : null,
        note.trim() || null
      );

      if (result.success) {
        setSuccess('Sipariş durumu başarıyla güncellendi!');
        setNote('');
        router.refresh();
      } else {
        setError(result.error || 'Sipariş durumu güncellenirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sipariş durumu güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Durum Güncelle</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {status === OrderStatus.SHIPPED && (
          <div>
            <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Kargo Takip Numarası *
            </label>
            <input
              type="text"
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Örn: ABC123456789"
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Kargo takip numarası zorunludur
            </p>
          </div>
        )}

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
            Not (Opsiyonel)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Durum değişikliği hakkında not ekleyin..."
            rows={3}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || status === currentStatus}
          className={`w-full px-4 py-2 rounded-md font-semibold transition-colors ${
            loading || status === currentStatus
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-pink-600 hover:bg-pink-700 text-white'
          }`}
        >
          {loading ? 'Güncelleniyor...' : 'Durumu Güncelle'}
        </button>
      </form>
    </div>
  );
}

