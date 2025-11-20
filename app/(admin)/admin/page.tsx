import { getDashboardStats } from '@/app/server-actions/reportActions';
import { getAllUsers } from '@/app/server-actions/userActions';
import { ProductRepository } from '@/lib/repositories/ProductRepository';
import { CategoryRepository } from '@/lib/repositories/CategoryRepository';
import Link from 'next/link';

export default async function AdminDashboard() {
  const statsResult = await getDashboardStats();
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;
  
  // Get additional statistics
  const usersResult = await getAllUsers();
  const users = usersResult.success && usersResult.data ? usersResult.data : [];
  
  const products = await ProductRepository.findAll(true);
  const categoriesResult = await CategoryRepository.findAll(true);
  const categories = categoriesResult || [];
  
  // Calculate additional stats
  const totalUsers = users.length;
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive && p.stock > 0).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const totalCategories = categories.length;

  const statusLabels: Record<string, string> = {
    PENDING: 'Beklemede',
    CONFIRMED: 'Onaylandı',
    SHIPPED: 'Kargoya Verildi',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal Edildi',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Yönetim paneline hoş geldiniz</p>
          </div>
          <Link
            href="/admin/reports"
            className="px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📊 Detaylı Raporlar
          </Link>
        </div>
      </div>

      {stats ? (
        <>
          {/* Main Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue */}
            <Link href="/admin/reports" className="group">
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg border-2 border-green-400 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white/90 mb-1">Toplam Gelir</div>
                <div className="text-3xl font-extrabold">{stats.totalRevenue.toFixed(2)} ₺</div>
              </div>
            </Link>

            {/* Total Orders */}
            <Link href="/admin/orders" className="group">
              <div className="bg-gradient-to-br from-primary-blue to-primary-blue-dark text-white p-6 rounded-xl shadow-lg border-2 border-primary-blue-light hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white/90 mb-1">Toplam Sipariş</div>
                <div className="text-3xl font-extrabold">{stats.totalOrders}</div>
              </div>
            </Link>

            {/* Pending Orders */}
            <Link href="/admin/orders?status=PENDING" className="group">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg border-2 border-yellow-400 hover:shadow-2xl transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-white/20 rounded-lg p-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white/90 mb-1">Bekleyen Sipariş</div>
                <div className="text-3xl font-extrabold">{stats.pendingOrders}</div>
              </div>
            </Link>

            {/* Today's Orders */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg border-2 border-purple-400">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 rounded-lg p-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-sm font-semibold text-white/90 mb-1">Bugünkü Sipariş</div>
              <div className="text-3xl font-extrabold mb-1">{stats.todayOrders}</div>
              <div className="text-sm font-semibold text-white/80">
                {stats.todayRevenue.toFixed(2)} ₺
              </div>
            </div>
          </div>

          {/* Secondary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Products */}
            <Link href="/admin/products" className="group">
              <div className="bg-white p-6 rounded-xl shadow-md border-2 border-transparent hover:border-accent-yellow transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Toplam Ürün</div>
                <div className="text-2xl font-extrabold text-gray-900">{totalProducts}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {activeProducts} aktif, {lowStockProducts} düşük stok
                </div>
              </div>
            </Link>

            {/* Categories */}
            <Link href="/admin/categories" className="group">
              <div className="bg-white p-6 rounded-xl shadow-md border-2 border-transparent hover:border-accent-yellow transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Kategoriler</div>
                <div className="text-2xl font-extrabold text-gray-900">{totalCategories}</div>
              </div>
            </Link>

            {/* Users */}
            <Link href="/admin/users" className="group">
              <div className="bg-white p-6 rounded-xl shadow-md border-2 border-transparent hover:border-accent-yellow transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Kullanıcılar</div>
                <div className="text-2xl font-extrabold text-gray-900">{totalUsers}</div>
              </div>
            </Link>

            {/* This Month Orders */}
            <div className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-indigo-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-1">Bu Ay Sipariş</div>
              <div className="text-2xl font-extrabold text-gray-900">{stats.thisMonthOrders}</div>
              <div className="text-xs text-green-600 font-semibold mt-1">
                {stats.thisMonthRevenue.toFixed(2)} ₺
              </div>
            </div>

            {/* Delivered Orders */}
            <Link href="/admin/orders?status=DELIVERED" className="group">
              <div className="bg-white p-6 rounded-xl shadow-md border-2 border-transparent hover:border-accent-yellow transition-all transform hover:scale-105">
                <div className="flex items-center justify-between mb-2">
                  <div className="bg-emerald-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Teslim Edilen</div>
                <div className="text-2xl font-extrabold text-gray-900">
                  {stats.statusDistribution.find(s => s.status === 'DELIVERED')?.count || 0}
                </div>
              </div>
            </Link>
          </div>

          {/* Stock Alerts */}
          {lowStockProducts > 0 && (
            <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-red-800 mb-1">⚠️ Düşük Stok Uyarısı</h3>
                    <p className="text-red-700">
                      <strong>{lowStockProducts}</strong> ürünün stoku kritik seviyede (≤10 adet)
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/products?lowStock=true"
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold shadow-md hover:shadow-lg"
                >
                  Ürünleri Görüntüle
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions & Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
                <h2 className="text-xl font-extrabold mb-4 text-gray-900">Hızlı İşlemler</h2>
                <div className="space-y-3">
                  <Link
                    href="/admin/products/new"
                    className="flex items-center gap-3 p-4 bg-accent-yellow/10 hover:bg-accent-yellow/20 rounded-lg transition-all group border-2 border-transparent hover:border-accent-yellow"
                  >
                    <div className="bg-accent-yellow rounded-lg p-2">
                      <svg className="w-5 h-5 text-primary-blue-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-primary-blue">Yeni Ürün Ekle</span>
                  </Link>

                  <Link
                    href="/admin/categories/new"
                    className="flex items-center gap-3 p-4 bg-primary-blue/10 hover:bg-primary-blue/20 rounded-lg transition-all group border-2 border-transparent hover:border-primary-blue"
                  >
                    <div className="bg-primary-blue rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-primary-blue">Yeni Kategori Ekle</span>
                  </Link>

                  <Link
                    href="/admin/orders?status=PENDING"
                    className="flex items-center gap-3 p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-all group border-2 border-transparent hover:border-yellow-400"
                  >
                    <div className="bg-yellow-500 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-yellow-700">Bekleyen Siparişler</span>
                  </Link>

                  <Link
                    href="/admin/reports"
                    className="flex items-center gap-3 p-4 bg-purple-100 hover:bg-purple-200 rounded-lg transition-all group border-2 border-transparent hover:border-purple-400"
                  >
                    <div className="bg-purple-500 rounded-lg p-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-purple-700">Detaylı Raporlar</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200">
                <h2 className="text-xl font-extrabold mb-6 text-gray-900">Sipariş Durumu Dağılımı</h2>
                <div className="space-y-4">
                  {stats.statusDistribution.length > 0 ? (
                    stats.statusDistribution.map((item) => {
                      const percentage = stats.totalOrders > 0 
                        ? ((item.count / stats.totalOrders) * 100).toFixed(1)
                        : '0';
                      
                      return (
                        <div key={item.status} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${statusColors[item.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                                {statusLabels[item.status] || item.status}
                              </span>
                              <span className="text-sm font-semibold text-gray-700">{item.count} sipariş</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${
                                statusColors[item.status]?.split(' ')[0] || 'bg-gray-400'
                              }`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-8">Henüz sipariş bulunmamaktadır.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600">İstatistikler yüklenirken bir hata oluştu.</p>
        </div>
      )}
    </div>
  );
}

