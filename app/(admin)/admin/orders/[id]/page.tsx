import { getOrderById, getOrderStatusHistory } from '@/app/server-actions/orderActions';
import { OrderRepository } from '@/lib/repositories/OrderRepository';
import { UserRepository } from '@/lib/repositories/UserRepository';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import OrderStatusUpdateForm from './OrderStatusUpdateForm';
import OrderStatusTimeline from './OrderStatusTimeline';
import CancelOrderButton from './CancelOrderButton';
import { formatDateToTurkey, formatDateToTurkeyShort } from '@/lib/utils/dateFormatter';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const orderId = parseInt(params.id, 10);

  if (isNaN(orderId)) {
    notFound();
  }

  const orderResult = await getOrderById(orderId);
  if (!orderResult.success || !orderResult.data) {
    notFound();
  }

  const order = orderResult.data;
  const shippingAddress = OrderRepository.parseShippingAddress(order.shippingAddressJson);

  // Get user information
  const user = await UserRepository.findById(order.userId);

  // Get status history
  const historyResult = await getOrderStatusHistory(orderId);
  const statusHistory = historyResult.success && historyResult.data ? historyResult.data : [];

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/orders"
            className="text-pink-600 hover:text-pink-700 mb-4 inline-block"
          >
            ← Sipariş Listesine Dön
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Sipariş Detayı - #{order.id}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Bilgileri</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Sipariş ID</p>
                  <p className="font-semibold text-gray-900">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sipariş Tarihi</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateToTurkey(order.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durum</p>
                  <span
                    className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                      statusColors[order.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Toplam</p>
                  <p className="font-semibold text-gray-900 text-lg">{order.total.toFixed(2)} ₺</p>
                </div>
                {order.trackingNumber && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Kargo Takip Numarası</p>
                    <p className="font-semibold text-gray-900">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Müşteri Bilgileri</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ad Soyad</p>
                  <p className="font-semibold text-gray-900">{user?.name || 'Bilinmiyor'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-posta</p>
                  <p className="font-semibold text-gray-900">{user?.email || 'Bilinmiyor'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kullanıcı ID</p>
                  <p className="font-semibold text-gray-900">{order.userId}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Teslimat Adresi</h2>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-semibold">Ad Soyad:</span> {shippingAddress.fullName}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold">Telefon:</span> {shippingAddress.phone}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold">Adres:</span> {shippingAddress.address}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold">Şehir:</span> {shippingAddress.city}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold">Posta Kodu:</span> {shippingAddress.postalCode}
                </p>
                <p className="text-gray-900">
                  <span className="font-semibold">Ülke:</span> {shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Ürünleri</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ürün</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Adet</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Birim Fiyat</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item: any) => {
                      const productImage = item.productImage || '/placeholder-image.svg';
                      return (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="relative h-16 w-16 flex-shrink-0">
                                <Image
                                  src={productImage}
                                  alt={item.nameSnapshot}
                                  fill
                                  className="object-cover rounded"
                                  sizes="64px"
                                />
                              </div>
                              <span className="text-sm text-gray-900">{item.nameSnapshot}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.priceSnapshot.toFixed(2)} ₺</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {(item.priceSnapshot * item.quantity).toFixed(2)} ₺
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        Toplam:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{order.total.toFixed(2)} ₺</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Update */}
            <OrderStatusUpdateForm orderId={order.id} currentStatus={order.status} currentTrackingNumber={order.trackingNumber} />

            {/* Cancel Order Button */}
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <CancelOrderButton orderId={order.id} />
            )}

            {/* Status History Timeline */}
            <OrderStatusTimeline history={statusHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

