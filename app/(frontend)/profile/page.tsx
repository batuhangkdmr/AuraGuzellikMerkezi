import { requireUser } from '@/lib/requireUser';
import { getUserOrders } from '@/app/server-actions/orderActions';
import Link from 'next/link';

export default async function ProfilePage() {
  const user = await requireUser();

  const ordersResult = await getUserOrders();
  const orders = ordersResult.success && ordersResult.data ? ordersResult.data : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hesabım</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hesap Bilgileri</h2>
              <div className="space-y-2 mb-4">
                <p className="text-gray-700">
                  <span className="font-medium">Ad:</span> {user.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">E-posta:</span> {user.email}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Rol:</span> {user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                </p>
              </div>
              <Link
                href="/profile/settings"
                className="block w-full text-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                ⚙️ Ayarları Düzenle
              </Link>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Siparişlerim</h2>

              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Henüz siparişiniz bulunmamaktadır.</p>
                  <Link
                    href="/products"
                    className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-yellow-100 text-yellow-800',
                      CONFIRMED: 'bg-blue-100 text-blue-800',
                      SHIPPED: 'bg-purple-100 text-purple-800',
                      DELIVERED: 'bg-green-100 text-green-800',
                      CANCELLED: 'bg-red-100 text-red-800',
                    };

                    const statusLabels: Record<string, string> = {
                      PENDING: 'Beklemede',
                      CONFIRMED: 'Onaylandı',
                      SHIPPED: 'Kargoya Verildi',
                      DELIVERED: 'Teslim Edildi',
                      CANCELLED: 'İptal Edildi',
                    };

                    return (
                      <Link
                        key={order.id}
                        href={`/profile/orders/${order.id}`}
                        className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">
                              Sipariş #{order.id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-lg">
                              {order.total.toFixed(2)} ₺
                            </p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                statusColors[order.status] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {statusLabels[order.status] || order.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

