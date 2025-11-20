import { requireUser } from '@/lib/requireUser';
import { getFavorites } from '@/app/server-actions/favoriteActions';
import Link from 'next/link';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import { getOrdersForUser } from '@/lib/services/userOrders';

export default async function ProfilePage() {
  const user = await requireUser();

  const orders = await getOrdersForUser(user.id);
  
  const favoritesResult = await getFavorites();
  const favorites = favoritesResult.success && favoritesResult.data ? favoritesResult.data : [];
  
  // Calculate statistics
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary-blue mb-2">Hesabım</h1>
          <p className="text-gray-600">Hesap bilgilerinizi yönetin ve siparişlerinizi takip edin</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Orders */}
          <Link href="#orders" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-accent-yellow transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-primary-blue/10 rounded-lg p-3">
                  <svg className="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-2xl font-extrabold text-primary-blue">{orders.length}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">Toplam Sipariş</p>
            </div>
          </Link>

          {/* Pending Orders */}
          <Link href="#orders" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-accent-yellow transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-yellow-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-extrabold text-yellow-600">{pendingOrders}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">Bekleyen Sipariş</p>
            </div>
          </Link>

          {/* Favorites */}
          <Link href="/favorites" className="group">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-transparent hover:border-accent-yellow transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-red-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-extrabold text-red-600">{favorites.length}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">Favorilerim</p>
            </div>
          </Link>

          {/* Total Spent */}
          <div className="bg-gradient-to-br from-primary-blue to-primary-blue-dark rounded-xl shadow-md p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-2xl font-extrabold">{totalSpent.toFixed(2)} ₺</span>
            </div>
            <p className="text-sm font-semibold text-white/90">Toplam Harcama</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Quick Links */}
          <div className="lg:col-span-1 space-y-4">
            {/* Account Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-blue to-primary-blue-dark rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-extrabold text-white">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-blue/10 text-primary-blue text-xs font-bold rounded-full">
                  {user.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Hızlı Erişim</h3>
              <div className="space-y-2">
                <Link
                  href="/profile/settings"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="bg-primary-blue/10 rounded-lg p-2 group-hover:bg-primary-blue/20 transition-colors">
                    <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Hesap Ayarları</span>
                </Link>

                <Link
                  href="/favorites"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="bg-red-100 rounded-lg p-2 group-hover:bg-red-200 transition-colors">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Favorilerim</span>
                  {favorites.length > 0 && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </Link>

                <Link
                  href="/profile/addresses"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="bg-primary-blue/10 rounded-lg p-2 group-hover:bg-primary-blue/20 transition-colors">
                    <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Adreslerim</span>
                </Link>

                <Link
                  href="/profile/notifications"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="bg-accent-yellow/20 rounded-lg p-2 group-hover:bg-accent-yellow/30 transition-colors">
                    <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Bildirimlerim</span>
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="bg-accent-yellow/20 rounded-lg p-2 group-hover:bg-accent-yellow/30 transition-colors">
                    <svg className="w-5 h-5 text-accent-yellow-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Sepetim</span>
                </Link>

                <Link
                  href="/products"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="bg-green-100 rounded-lg p-2 group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-700">Alışverişe Devam</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content - Orders */}
          <div className="lg:col-span-3" id="orders">
            <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">Siparişlerim</h2>
                <div className="flex items-center gap-3">
                  {orders.length > 0 && (
                    <Link
                      href="/profile/orders"
                      className="text-sm font-semibold text-primary-blue hover:text-primary-blue-dark transition-colors"
                    >
                      Tümünü Gör →
                    </Link>
                  )}
                  <Link
                    href="/products"
                    className="px-4 py-2 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold text-sm"
                  >
                    Yeni Sipariş Ver
                  </Link>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-600 mb-2 text-lg font-semibold">Henüz siparişiniz bulunmamaktadır</p>
                  <p className="text-gray-500 mb-6 text-sm">İlk siparişinizi vermek için alışverişe başlayın</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusColors: Record<string, string> = {
                      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                      CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-300',
                      SHIPPED: 'bg-purple-100 text-purple-800 border-purple-300',
                      DELIVERED: 'bg-green-100 text-green-800 border-green-300',
                      CANCELLED: 'bg-red-100 text-red-800 border-red-300',
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
                        className="block border-2 border-gray-200 rounded-xl p-5 hover:border-accent-yellow hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-extrabold text-gray-900 text-lg">
                                Sipariş #{order.id}
                              </p>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-bold border-2 ${
                                  statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-300'
                                }`}
                              >
                                {statusLabels[order.status] || order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDateToTurkey(order.createdAt)}
                            </p>
                        {order.trackingNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            Kargo Takip No: <span className="font-semibold text-primary-blue">{order.trackingNumber}</span>
                          </p>
                        )}
                          </div>
                          <div className="text-right sm:text-left sm:min-w-[120px]">
                            <p className="font-extrabold text-primary-blue text-xl mb-1">
                              {order.total.toFixed(2)} ₺
                            </p>
                            <span className="inline-flex items-center gap-1 text-sm text-gray-500 group-hover:text-primary-blue transition-colors">
                              Detayları Gör
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
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

