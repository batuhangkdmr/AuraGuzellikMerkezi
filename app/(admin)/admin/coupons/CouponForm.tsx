'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCoupon, updateCoupon } from '@/app/server-actions/couponActions';
import { showToast } from '@/components/ToastContainer';
import Link from 'next/link';
import { DiscountType } from '@/lib/repositories/CouponRepository';

interface CouponFormProps {
  coupon?: {
    id: number;
    code: string;
    description: string | null;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount: number | null;
    maxDiscountAmount: number | null;
    usageLimit: number | null;
    isActive: boolean;
    validFrom: Date;
    validUntil: Date | null;
  };
}

export default function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'PERCENTAGE' as DiscountType,
    discountValue: coupon?.discountValue || 0,
    minPurchaseAmount: coupon?.minPurchaseAmount?.toString() || '',
    maxDiscountAmount: coupon?.maxDiscountAmount?.toString() || '',
    usageLimit: coupon?.usageLimit?.toString() || '',
    validFrom: coupon?.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: coupon?.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') {
          formDataObj.append(key, value.toString());
        } else if (key === 'validUntil') {
          formDataObj.append(key, '');
        }
      });

      const result = coupon
        ? await updateCoupon(coupon.id, formDataObj)
        : await createCoupon(formDataObj);

      if (result.success) {
        showToast(
          coupon ? 'Kupon güncellendi' : 'Kupon oluşturuldu',
          'success'
        );
        router.push('/admin/coupons');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 lg:p-8 border-2 border-gray-200 max-w-3xl">
      <div className="space-y-6">
        {/* Code */}
        <div>
          <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
            Kupon Kodu *
          </label>
          <input
            type="text"
            id="code"
            name="code"
            required
            value={formData.code}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all uppercase"
            placeholder="Örn: YAZ2024"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Açıklama
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
            placeholder="Kupon açıklaması..."
          />
        </div>

        {/* Discount Type and Value */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="discountType" className="block text-sm font-semibold text-gray-700 mb-2">
              İndirim Tipi *
            </label>
              <select
                id="discountType"
                name="discountType"
                required
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
              >
                <option value="PERCENTAGE">Yüzde (%)</option>
                <option value="FIXED">Sabit Tutar (₺)</option>
              </select>
          </div>

          <div>
            <label htmlFor="discountValue" className="block text-sm font-semibold text-gray-700 mb-2">
              İndirim Değeri *
            </label>
            <input
              type="number"
              id="discountValue"
              name="discountValue"
              required
              min="0"
              step="0.01"
              value={formData.discountValue}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
            />
          </div>
        </div>

        {/* Min Purchase Amount and Max Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="minPurchaseAmount" className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Alışveriş Tutarı (₺)
            </label>
            <input
              type="number"
              id="minPurchaseAmount"
              name="minPurchaseAmount"
              min="0"
              step="0.01"
              value={formData.minPurchaseAmount}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
              placeholder="Boş bırakılabilir"
            />
          </div>

          <div>
            <label htmlFor="maxDiscountAmount" className="block text-sm font-semibold text-gray-700 mb-2">
              Maksimum İndirim (₺)
            </label>
            <input
              type="number"
              id="maxDiscountAmount"
              name="maxDiscountAmount"
              min="0"
              step="0.01"
              value={formData.maxDiscountAmount}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
              placeholder="Boş bırakılabilir"
            />
          </div>
        </div>

        {/* Usage Limit */}
        <div>
          <label htmlFor="usageLimit" className="block text-sm font-semibold text-gray-700 mb-2">
            Kullanım Limiti
          </label>
          <input
            type="number"
            id="usageLimit"
            name="usageLimit"
            min="1"
            value={formData.usageLimit}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
            placeholder="Boş bırakılırsa sınırsız"
          />
          <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa kupon sınırsız kullanılabilir</p>
        </div>

        {/* Valid From and Until */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="validFrom" className="block text-sm font-semibold text-gray-700 mb-2">
              Geçerlilik Başlangıcı *
            </label>
            <input
              type="date"
              id="validFrom"
              name="validFrom"
              required
              value={formData.validFrom}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
            />
          </div>

          <div>
            <label htmlFor="validUntil" className="block text-sm font-semibold text-gray-700 mb-2">
              Geçerlilik Bitişi
            </label>
            <input
              type="date"
              id="validUntil"
              name="validUntil"
              value={formData.validUntil}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa süresiz geçerli</p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Kaydediliyor...' : coupon ? 'Güncelle' : 'Kupon Oluştur'}
          </button>
          <Link
            href="/admin/coupons"
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-bold text-center"
          >
            İptal
          </Link>
        </div>
      </div>
    </form>
  );
}

