import { requireUser } from '@/lib/requireUser';
import Link from 'next/link';
import CouponForm from '../CouponForm';

export default async function NewCouponPage() {
  await requireUser('ADMIN');

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
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Yeni Kupon Oluştur</h1>
        <p className="text-gray-600">Yeni bir indirim kuponu oluşturun</p>
      </div>

      {/* Coupon Form */}
      <CouponForm />
    </div>
  );
}

