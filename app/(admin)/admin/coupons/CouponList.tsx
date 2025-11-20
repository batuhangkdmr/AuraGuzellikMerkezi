'use client';

import { useState } from 'react';
import { deleteCoupon, updateCoupon } from '@/app/server-actions/couponActions';
import { showToast } from '@/components/ToastContainer';
import Link from 'next/link';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import { DiscountType } from '@/lib/repositories/CouponRepository';

interface Coupon {
  id: number;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
}

interface CouponListProps {
  initialCoupons: Coupon[];
}

export default function CouponList({ initialCoupons }: CouponListProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
      return;
    }

    setDeletingId(id);
    const result = await deleteCoupon(id);
    
    if (result.success) {
      setCoupons(coupons.filter(c => c.id !== id));
      showToast('Kupon başarıyla silindi', 'success');
    } else {
      showToast(result.error || 'Kupon silinirken bir hata oluştu', 'error');
    }
    setDeletingId(null);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setTogglingId(coupon.id);
    const formData = new FormData();
    formData.append('isActive', (!coupon.isActive).toString());
    
    const result = await updateCoupon(coupon.id, formData);
    
    if (result.success) {
      setCoupons(coupons.map(c => 
        c.id === coupon.id ? { ...c, isActive: !c.isActive } : c
      ));
      showToast('Kupon durumu güncellendi', 'success');
    } else {
      showToast(result.error || 'Kupon güncellenirken bir hata oluştu', 'error');
    }
    setTogglingId(null);
  };

  const isExpired = (coupon: Coupon) => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  const isActive = (coupon: Coupon) => {
    return coupon.isActive && !isExpired(coupon) && 
           (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit);
  };

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-gray-200">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600 text-lg font-semibold">Henüz kupon bulunmamaktadır</p>
        <Link
          href="/admin/coupons/new"
          className="inline-block mt-4 px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold"
        >
          İlk Kuponu Oluştur
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kupon Kodu</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">İndirim</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kullanım</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Geçerlilik</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-gray-900">{coupon.code}</p>
                    {coupon.description && (
                      <p className="text-sm text-gray-600 mt-1">{coupon.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-primary-blue">
                      {coupon.discountType === 'PERCENTAGE' 
                        ? `%${coupon.discountValue}` 
                        : `${coupon.discountValue} ₺`}
                    </p>
                    {coupon.minPurchaseAmount && (
                      <p className="text-xs text-gray-500">Min: {coupon.minPurchaseAmount} ₺</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm text-gray-900">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="text-gray-900">Başlangıç: {formatDateToTurkey(coupon.validFrom)}</p>
                    {coupon.validUntil && (
                      <p className={`text-gray-600 ${isExpired(coupon) ? 'text-red-600 font-semibold' : ''}`}>
                        Bitiş: {formatDateToTurkey(coupon.validUntil)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 ${
                    isActive(coupon)
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : isExpired(coupon)
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}>
                    {isActive(coupon) ? 'Aktif' : isExpired(coupon) ? 'Süresi Dolmuş' : 'Pasif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(coupon)}
                      disabled={togglingId === coupon.id}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        coupon.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      } disabled:opacity-50`}
                    >
                      {togglingId === coupon.id ? '...' : coupon.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                    </button>
                    <Link
                      href={`/admin/coupons/${coupon.id}/edit`}
                      className="px-3 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-all font-semibold text-xs"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      disabled={deletingId === coupon.id}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-xs disabled:opacity-50"
                    >
                      {deletingId === coupon.id ? '...' : 'Sil'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

