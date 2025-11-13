import { getDashboardStats } from '@/app/server-actions/reportActions';
import Link from 'next/link';

export default async function AdminDashboard() {
  const statsResult = await getDashboardStats();
  const stats = statsResult.success && statsResult.data ? statsResult.data : null;

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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/admin/reports"
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          📊 Detaylı Raporlar
        </Link>
      </div>

      {stats ? (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="text-gray-500 text-sm mb-2">Toplam Sipariş</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalOrders}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="text-gray-500 text-sm mb-2">Toplam Gelir</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.totalRevenue.toFixed(2)} ₺
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="text-gray-500 text-sm mb-2">Bekleyen Siparişler</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="text-gray-500 text-sm mb-2">Bugünkü Siparişler</div>
              <div className="text-3xl font-bold text-purple-600">{stats.todayOrders}</div>
              <div className="text-sm text-gray-500 mt-1">
                {stats.todayRevenue.toFixed(2)} ₺
              </div>
            </div>
          </div>

          {/* Monthly Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Bu Ay</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sipariş Sayısı:</span>
                  <span className="font-semibold text-gray-900">{stats.thisMonthOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gelir:</span>
                  <span className="font-semibold text-green-600">
                    {stats.thisMonthRevenue.toFixed(2)} ₺
                  </span>
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Sipariş Durumu Dağılımı</h2>
              <div className="space-y-2">
                {stats.statusDistribution.length > 0 ? (
                  stats.statusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {statusLabels[item.status] || item.status}:
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              statusColors[item.status]?.split(' ')[0] || 'bg-gray-400'
                            }`}
                            style={{
                              width: `${(item.count / stats.totalOrders) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Henüz sipariş bulunmamaktadır.</p>
                )}
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

