import { requireUser } from '@/lib/requireUser';
import { getAllReturns } from '@/app/server-actions/returnActions';
import Link from 'next/link';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import ReturnList from './ReturnList';

export default async function AdminReturnsPage() {
  await requireUser('ADMIN');

  const returnsResult = await getAllReturns();
  const returns = returnsResult.success && returnsResult.data ? returnsResult.data : [];

  // Calculate statistics
  const totalReturns = returns.length;
  const pendingReturns = returns.filter(r => r.status === 'PENDING').length;
  const approvedReturns = returns.filter(r => r.status === 'APPROVED').length;
  const rejectedReturns = returns.filter(r => r.status === 'REJECTED').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">İade/İptal Talepleri</h1>
        <p className="text-gray-600">İade ve iptal taleplerini görüntüleyin ve yönetin</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Toplam Talep</p>
              <p className="text-3xl font-extrabold text-gray-900">{totalReturns}</p>
            </div>
            <div className="bg-primary-blue/10 rounded-lg p-3">
              <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Bekleyen</p>
              <p className="text-3xl font-extrabold text-yellow-600">{pendingReturns}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Onaylanan</p>
              <p className="text-3xl font-extrabold text-green-600">{approvedReturns}</p>
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
              <p className="text-gray-500 text-sm mb-1">Reddedilen</p>
              <p className="text-3xl font-extrabold text-red-600">{rejectedReturns}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Returns List */}
      <ReturnList initialReturns={returns} />
    </div>
  );
}

