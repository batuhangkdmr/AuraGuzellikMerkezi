import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/requireUser';
import { getUserById } from '@/app/server-actions/userActions';
import { getUserOrders } from '@/app/server-actions/orderActions';
import { getUserAddresses } from '@/app/server-actions/addressActions';
import Link from 'next/link';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import { UserRole } from '@/lib/types/UserRole';

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser('ADMIN');
  
  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    notFound();
  }

  const userResult = await getUserById(userId);
  if (!userResult.success || !userResult.data) {
    notFound();
  }

  const user = userResult.data;

  // Get user orders (we need to modify getUserOrders to accept userId for admin)
  // For now, we'll get orders from the order repository directly
  const { OrderRepository } = await import('@/lib/repositories/OrderRepository');
  const orders = await OrderRepository.findByUserId(userId);

  // Get user addresses
  const addressesResult = await getUserAddresses();
  // We need to filter addresses by userId, but getUserAddresses only returns current user's addresses
  // We'll need to create a new function or modify the existing one
  // For now, let's create a helper function
  const { UserAddressRepository } = await import('@/lib/repositories/UserAddressRepository');
  const addresses = await UserAddressRepository.findByUserId(userId);

  const roleLabels: Record<string, string> = {
    [UserRole.ADMIN]: 'Yönetici',
    [UserRole.USER]: 'Kullanıcı',
  };

  const roleColors: Record<string, string> = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-800 border-red-300',
    [UserRole.USER]: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Beklemede',
    CONFIRMED: 'Onaylandı',
    SHIPPED: 'Kargoya Verildi',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal Edildi',
  };

  // Calculate statistics
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="text-primary-blue hover:text-primary-blue-dark mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kullanıcı Yönetimine Dön
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Kullanıcı Detayları</h1>
            <p className="text-gray-600">Kullanıcı bilgileri, siparişler ve adresler</p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6 lg:p-8 border-2 border-gray-200 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-blue to-primary-blue-dark rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-extrabold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-extrabold text-gray-900">{user.name}</h2>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 ${roleColors[user.role] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                {roleLabels[user.role] || user.role}
              </span>
            </div>
            <p className="text-gray-600 mb-1">📧 {user.email}</p>
            <p className="text-sm text-gray-500">Kullanıcı ID: #{user.id}</p>
            <p className="text-sm text-gray-500">Kayıt Tarihi: {formatDateToTurkey(user.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Toplam Sipariş</p>
              <p className="text-2xl font-extrabold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-primary-blue/10 rounded-lg p-3">
              <svg className="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Bekleyen</p>
              <p className="text-2xl font-extrabold text-yellow-600">{pendingOrders}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Teslim Edildi</p>
              <p className="text-2xl font-extrabold text-green-600">{deliveredOrders}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Toplam Harcama</p>
              <p className="text-2xl font-extrabold text-blue-600">{totalSpent.toFixed(2)} ₺</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Siparişler ({orders.length})</h2>
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Henüz sipariş bulunmamaktadır</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Sipariş #{order.id}</p>
                      <p className="text-sm text-gray-600">{formatDateToTurkey(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-blue">{order.total.toFixed(2)} ₺</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Addresses List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">Adresler ({addresses.length})</h2>
          </div>
          {addresses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Henüz adres eklenmemiş</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {addresses.map((address) => (
                <div key={address.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">{address.title}</p>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-accent-yellow text-primary-blue-dark rounded-full text-xs font-bold">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{address.fullName}</p>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      <p className="text-sm text-gray-600">
                        {address.postalCode} {address.city}, {address.country}
                      </p>
                      <p className="text-sm text-gray-600">📞 {address.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

