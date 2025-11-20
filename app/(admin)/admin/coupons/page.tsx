import { requireUser } from '@/lib/requireUser';
import { getAllCoupons } from '@/app/server-actions/couponActions';
import Link from 'next/link';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import CouponList from './CouponList';

export default async function AdminCouponsPage() {
  await requireUser('ADMIN');

  const couponsResult = await getAllCoupons();
  const coupons = couponsResult.success && couponsResult.data ? couponsResult.data : [];

  // Calculate statistics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.expiresAt) > new Date()).length;
  const expiredCoupons = coupons.filter(c => new Date(c.expiresAt) <= new Date()).length;
  const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Kupon Yönetimi</h1>
          <p className="text-gray-600">Kuponları görüntüleyin ve yönetin</p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold shadow-md hover:shadow-lg"
        >
          + Yeni Kupon
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Toplam Kupon</p>
              <p className="text-3xl font-extrabold text-gray-900">{totalCoupons}</p>
            </div>
            <div className="bg-primary-blue/10 rounded-lg p-3">
              <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Aktif Kupon</p>
              <p className="text-3xl font-extrabold text-green-600">{activeCoupons}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Süresi Dolmuş</p>
              <p className="text-3xl font-extrabold text-red-600">{expiredCoupons}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Toplam Kullanım</p>
              <p className="text-3xl font-extrabold text-blue-600">{totalUsage}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <CouponList initialCoupons={coupons} />
    </div>
  );
}

