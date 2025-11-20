import { requireUser } from '@/lib/requireUser';
import Link from 'next/link';
import Image from 'next/image';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import { getOrdersForUser } from '@/lib/services/userOrders';

export default async function OrdersPage() {
  const user = await requireUser();

  const orders = await getOrdersForUser(user.id);

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

  const statusIcons: Record<string, string> = {
    PENDING: '⏳',
    CONFIRMED: '✅',
    SHIPPED: '📦',
    DELIVERED: '🎉',
    CANCELLED: '❌',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Siparişlerim</h1>
              <p className="text-gray-600">Tüm siparişlerinizi buradan görüntüleyebilir ve takip edebilirsiniz</p>
            </div>
            <Link
              href="/products"
              className="px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold shadow-md hover:shadow-lg"
            >
              Yeni Sipariş Ver
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-5 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Toplam Sipariş</p>
                  <p className="text-2xl font-extrabold text-gray-900">{orders.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary-blue/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Bekleyen</p>
                  <p className="text-2xl font-extrabold text-yellow-600">
                    {orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Kargoda</p>
                  <p className="text-2xl font-extrabold text-purple-600">
                    {orders.filter(o => o.status === 'SHIPPED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-2 border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Teslim Edildi</p>
                  <p className="text-2xl font-extrabold text-green-600">
                    {orders.filter(o => o.status === 'DELIVERED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-200">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz siparişiniz yok</h3>
            <p className="text-gray-600 mb-8 text-lg">İlk siparişinizi vermek için alışverişe başlayın</p>
            <Link
              href="/products"
              className="inline-block px-8 py-4 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold text-lg shadow-md hover:shadow-lg"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/profile/orders/${order.id}`}
                className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-accent-yellow/50 overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b-2 border-gray-100">
                    <div className="mb-3 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-extrabold text-gray-900">
                          Sipariş #{order.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${statusColors[order.status]}`}>
                          {statusIcons[order.status]} {statusLabels[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Sipariş Tarihi:</span> {formatDateToTurkey(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-primary-blue mb-1">
                        {order.total.toFixed(2)} ₺
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items?.length || 0} ürün
                      </p>
                      {order.trackingNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          Kargo Takip: <span className="font-semibold text-primary-blue">{order.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {order.items?.slice(0, 3).map((item: any, index: number) => {
                      const productImage = item.productImage || '/placeholder-image.svg';
                      return (
                        <div key={item.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <Image
                              src={productImage}
                              alt={item.nameSnapshot}
                              fill
                              className="object-cover rounded-lg"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {item.nameSnapshot}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.quantity} adet × {item.priceSnapshot.toFixed(2)} ₺
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {order.items && order.items.length > 3 && (
                      <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-600">
                          +{order.items.length - 3} ürün daha
                        </p>
                      </div>
                    )}
                  </div>

                  {/* View Details Link */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Teslimat Adresi: {order.shippingAddress?.city || 'Belirtilmemiş'}
                      </span>
                      <span className="text-sm font-semibold text-primary-blue hover:text-primary-blue-dark flex items-center gap-1">
                        Detayları Gör
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

