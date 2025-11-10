import { notFound } from 'next/navigation';
import { getOrderById } from '@/app/server-actions/orderActions';
import Link from 'next/link';

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = parseInt(params.id, 10);
  
  if (isNaN(orderId)) {
    notFound();
  }

  const result = await getOrderById(orderId);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;
  const shippingAddress = order.shippingAddress;

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
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/profile"
          className="text-pink-600 hover:text-pink-700 mb-4 inline-block"
        >
          ← Hesabıma Dön
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Sipariş #{order.id}</h1>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                statusColors[order.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusLabels[order.status] || order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Order Info */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Bilgileri</h2>
              <div className="space-y-2 text-gray-700">
                <p>
                  <span className="font-medium">Sipariş Tarihi:</span>{' '}
                  {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                {order.confirmedAt && (
                  <p>
                    <span className="font-medium">Onay Tarihi:</span>{' '}
                    {new Date(order.confirmedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                <p>
                  <span className="font-medium">Toplam:</span>{' '}
                  <span className="text-2xl font-bold text-pink-600">
                    {order.total.toFixed(2)} ₺
                  </span>
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Teslimat Adresi</h2>
              <div className="space-y-2 text-gray-700">
                <p>{shippingAddress.fullName}</p>
                <p>{shippingAddress.phone}</p>
                <p>{shippingAddress.address}</p>
                <p>
                  {shippingAddress.postalCode} {shippingAddress.city}
                </p>
                <p>{shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Detayları</h2>
            <div className="border-t border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Ürün</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Fiyat</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Miktar</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-gray-900">{item.nameSnapshot}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {item.priceSnapshot.toFixed(2)} ₺
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">
                        {(item.priceSnapshot * item.quantity).toFixed(2)} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

