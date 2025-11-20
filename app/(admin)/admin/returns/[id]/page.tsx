import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/requireUser';
import { getAllReturns } from '@/app/server-actions/returnActions';
import { ReturnRepository } from '@/lib/repositories/ReturnRepository';
import { OrderRepository } from '@/lib/repositories/OrderRepository';
import { UserRepository } from '@/lib/repositories/UserRepository';
import Link from 'next/link';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import ReturnStatusUpdateForm from './ReturnStatusUpdateForm';

export default async function ReturnDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser('ADMIN');
  
  const returnId = parseInt(params.id, 10);
  if (isNaN(returnId)) {
    notFound();
  }

  const returnRequest = await ReturnRepository.findById(returnId);
  if (!returnRequest) {
    notFound();
  }

  // Get order and user info
  const order = await OrderRepository.findById(returnRequest.orderId);
  const user = await UserRepository.findById(returnRequest.userId);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    APPROVED: 'bg-green-100 text-green-800 border-green-300',
    REJECTED: 'bg-red-100 text-red-800 border-red-300',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300',
    COMPLETED: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Beklemede',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    PROCESSING: 'İşleniyor',
    COMPLETED: 'Tamamlandı',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/returns"
          className="text-primary-blue hover:text-primary-blue-dark mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          İade Taleplerine Dön
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">İade Talep Detayı</h1>
            <p className="text-gray-600">İade talebi bilgileri ve yönetimi</p>
          </div>
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 ${statusColors[returnRequest.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
            {statusLabels[returnRequest.status] || returnRequest.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return Info */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Talep Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Talep ID</p>
                <p className="font-semibold text-gray-900">#{returnRequest.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Talep Türü</p>
                <p className="font-semibold text-gray-900">
                  {returnRequest.requestType === 'CANCELLATION' ? 'İptal Talebi' : 'Ürün İadesi'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Sipariş</p>
                <Link
                  href={`/admin/orders/${returnRequest.orderId}`}
                  className="font-semibold text-primary-blue hover:text-primary-blue-dark"
                >
                  Sipariş #{returnRequest.orderId}
                </Link>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">İade Nedeni</p>
                <p className="text-gray-900">{returnRequest.reason}</p>
              </div>
              {returnRequest.adminNote && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Admin Notu</p>
                  <p className="text-gray-900">{returnRequest.adminNote}</p>
                </div>
              )}
              {returnRequest.refundAmount && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">İade Tutarı</p>
                  <p className="text-2xl font-extrabold text-primary-blue">{returnRequest.refundAmount.toFixed(2)} ₺</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Oluşturulma</p>
                  <p className="text-sm text-gray-900">{formatDateToTurkey(returnRequest.createdAt)}</p>
                </div>
                {returnRequest.processedAt && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">İşlenme</p>
                    <p className="text-sm text-gray-900">{formatDateToTurkey(returnRequest.processedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Return Items */}
          {returnRequest.items && returnRequest.items.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
              <h2 className="text-xl font-extrabold text-gray-900 mb-4">İade Edilecek Ürünler</h2>
              <div className="space-y-3">
                {returnRequest.items.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Sipariş Öğesi ID: #{item.orderItemId}</p>
                    <p className="font-semibold text-gray-900">Miktar: {item.quantity}</p>
                    {item.reason && (
                      <p className="text-sm text-gray-700 mt-2">Neden: {item.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">Müşteri Bilgileri</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Kullanıcı</p>
                <Link
                  href={`/admin/users/${returnRequest.userId}`}
                  className="font-semibold text-primary-blue hover:text-primary-blue-dark"
                >
                  {user?.name || `Kullanıcı #${returnRequest.userId}`}
                </Link>
              </div>
              {user?.email && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">E-posta</p>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Update Form */}
          <ReturnStatusUpdateForm returnRequest={{
            id: returnRequest.id,
            status: returnRequest.status,
            refundAmount: returnRequest.refundAmount,
            requestType: returnRequest.requestType,
          }} />
        </div>
      </div>
    </div>
  );
}

