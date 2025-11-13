'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelOrder } from '@/app/server-actions/orderActions';

interface CancelOrderButtonProps {
  orderId: number;
}

export default function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm('Bu siparişi iptal etmek istediğinize emin misiniz? Stoklar otomatik olarak geri eklenecektir.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await cancelOrder(orderId);

      if (result.success) {
        alert('Sipariş başarıyla iptal edildi. Stoklar geri eklendi.');
        router.refresh();
      } else {
        setError(result.error || 'Sipariş iptal edilirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sipariş iptal edilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş İptali</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-600 mb-4">
        Siparişi iptal etmek istediğinize emin misiniz? İptal edildiğinde stoklar otomatik olarak geri eklenecektir.
      </p>

      <button
        onClick={handleCancel}
        disabled={loading}
        className={`w-full px-4 py-2 rounded-md font-semibold transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {loading ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}
      </button>
    </div>
  );
}

