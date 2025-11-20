'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateReturnStatus } from '@/app/server-actions/returnActions';
import { showToast } from '@/components/ToastContainer';
import { ReturnStatus } from '@/lib/repositories/ReturnRepository';

interface ReturnStatusUpdateFormProps {
  returnRequest: {
    id: number;
    status: ReturnStatus;
    refundAmount: number | null;
    requestType: 'RETURN' | 'CANCELLATION';
  };
}

export default function ReturnStatusUpdateForm({ returnRequest }: ReturnStatusUpdateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<ReturnStatus>(returnRequest.status);
  const [adminNote, setAdminNote] = useState('');
  const [refundAmount, setRefundAmount] = useState(returnRequest.refundAmount?.toString() || '');
  const isCancellation = returnRequest.requestType === 'CANCELLATION';

  const statusOptions: ReturnStatus[] = isCancellation
    ? ['PENDING', 'APPROVED', 'REJECTED']
    : ['PENDING', 'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateReturnStatus(
        returnRequest.id,
        status,
        adminNote || null,
        refundAmount ? parseFloat(refundAmount) : null
      );

      if (result.success) {
        showToast('İade durumu güncellendi', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Bir hata oluştu', 'error');
      }
    } catch (error) {
      showToast('Bir hata oluştu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
      <h2 className="text-xl font-extrabold text-gray-900 mb-4">Durum Güncelle</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
            Durum *
          </label>
          <select
            id="status"
            name="status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as ReturnStatus)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>
                {option === 'PENDING'
                  ? 'Beklemede'
                  : option === 'APPROVED'
                    ? 'Onaylandı'
                    : option === 'REJECTED'
                      ? 'Reddedildi'
                      : option === 'PROCESSING'
                        ? 'İşleniyor'
                        : 'Tamamlandı'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="adminNote" className="block text-sm font-semibold text-gray-700 mb-2">
            Admin Notu
          </label>
          <textarea
            id="adminNote"
            name="adminNote"
            rows={3}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
            placeholder="İade hakkında not..."
          />
        </div>

        {!isCancellation && (
          <div>
            <label htmlFor="refundAmount" className="block text-sm font-semibold text-gray-700 mb-2">
              İade Tutarı (₺)
            </label>
            <input
              type="number"
              id="refundAmount"
              name="refundAmount"
              min="0"
              step="0.01"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
              placeholder="İade edilecek tutar"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Güncelleniyor...' : 'Durumu Güncelle'}
        </button>
        {isCancellation && (
          <p className="text-xs text-gray-500">
            Onayladığınızda sipariş otomatik olarak iptal edilir ve talep tamamlanır.
          </p>
        )}
      </div>
    </form>
  );
}

