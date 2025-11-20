import { notFound } from 'next/navigation';
import { getOrderById, getOrderStatusHistory } from '@/app/server-actions/orderActions';
import Link from 'next/link';
import Image from 'next/image';
import UserOrderStatusTimeline from './UserOrderStatusTimeline';
import CancelOrderButton from './CancelOrderButton';
import { formatDateToTurkey, formatDateToTurkeyShort } from '@/lib/utils/dateFormatter';

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

  // Get status history
  const historyResult = await getOrderStatusHistory(order.id);
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
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link href="/profile" className="text-gray-600 hover:text-primary-blue transition-colors">
            Hesabım
          </Link>
          <span className="text-gray-400">/</span>
          <Link href="/profile/orders" className="text-gray-600 hover:text-primary-blue transition-colors">
            Siparişlerim
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Sipariş #{order.id}</span>
        </div>

        {/* Success Banner (if just completed) */}
        {order.status === 'PENDING' && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-green-800 mb-1">🎉 Siparişiniz Alındı!</h2>
                <p className="text-green-700">
                  Siparişiniz başarıyla oluşturuldu. Sipariş numaranız: <strong>#{order.id}</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 border-2 border-gray-100">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b-2 border-gray-200">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Sipariş #{order.id}</h1>
              <p className="text-gray-600">
                Sipariş Tarihi: <span className="font-semibold">{formatDateToTurkey(order.createdAt)}</span>
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 ${
                  statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                <span className="text-lg">
                  {order.status === 'PENDING' && '⏳'}
                  {order.status === 'CONFIRMED' && '✅'}
                  {order.status === 'SHIPPED' && '📦'}
                  {order.status === 'DELIVERED' && '🎉'}
                  {order.status === 'CANCELLED' && '❌'}
                </span>
                {statusLabels[order.status] || order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Order Info */}
            <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Sipariş Bilgileri
              </h2>
              <div className="space-y-3 text-gray-700">
                {order.confirmedAt && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Onay Tarihi:</span>
                    <span>{formatDateToTurkey(order.confirmedAt)}</span>
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Kargo Takip No:</span>
                    <span className="font-bold text-primary-blue bg-primary-blue/10 px-3 py-1 rounded-lg">
                      {order.trackingNumber}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Toplam Tutar:</span>
                    <span className="text-3xl font-extrabold text-primary-blue">
                      {order.total.toFixed(2)} ₺
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Teslimat Adresi
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold text-gray-900">{shippingAddress.fullName}</p>
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {shippingAddress.phone}
                </p>
                <p className="text-sm leading-relaxed">{shippingAddress.address}</p>
                <p className="text-sm">
                  {shippingAddress.postalCode} {shippingAddress.city}
                </p>
                <p className="text-sm">{shippingAddress.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Sipariş Detayları ({order.items.length} ürün)
            </h2>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="space-y-4">
                {order.items.map((item: any) => {
                  const productImage = item.productImage || '/placeholder-image.svg';
                  return (
                    <div key={item.id} className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-accent-yellow/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20 flex-shrink-0">
                          <Image
                            src={productImage}
                            alt={item.nameSnapshot}
                            fill
                            className="object-cover rounded-lg"
                            sizes="80px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1">{item.nameSnapshot}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Adet: <strong className="text-gray-900">{item.quantity}</strong></span>
                            <span>Birim Fiyat: <strong className="text-gray-900">{item.priceSnapshot.toFixed(2)} ₺</strong></span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-extrabold text-primary-blue">
                            {(item.priceSnapshot * item.quantity).toFixed(2)} ₺
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-6 border-t-2 border-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Toplam:</span>
                  <span className="text-3xl font-extrabold text-primary-blue">
                    {order.total.toFixed(2)} ₺
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mb-8">
            <UserOrderStatusTimeline history={statusHistory} />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/profile/orders"
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-bold text-center"
            >
              ← Tüm Siparişlere Dön
            </Link>
            {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
              <div className="flex-1">
                <CancelOrderButton
                  orderId={order.id}
                  existingRequest={order.cancellationRequest || null}
                />
              </div>
            )}
            <Link
              href="/products"
              className="flex-1 px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold text-center shadow-md hover:shadow-lg"
            >
              Alışverişe Devam Et →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

