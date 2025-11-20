import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/requireUser';
import { getAllCoupons } from '@/app/server-actions/couponActions';
import Link from 'next/link';
import CouponForm from '../../CouponForm';

export default async function EditCouponPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser('ADMIN');
  
  const couponId = parseInt(params.id, 10);
  if (isNaN(couponId)) {
    notFound();
  }

  const couponsResult = await getAllCoupons();
  const coupons = couponsResult.success && couponsResult.data ? couponsResult.data : [];
  const coupon = coupons.find(c => c.id === couponId);

  if (!coupon) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/coupons"
          className="text-primary-blue hover:text-primary-blue-dark mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kupon Yönetimine Dön
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Kuponu Düzenle</h1>
        <p className="text-gray-600">Kupon bilgilerini güncelleyin</p>
      </div>

      {/* Coupon Form */}
      <CouponForm coupon={coupon} />
    </div>
  );
}

