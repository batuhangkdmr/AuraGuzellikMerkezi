import { Suspense } from 'react';
import { getSalesReport, getProductSalesReport } from '@/app/server-actions/reportActions';
import { formatDateToTurkeyShort } from '@/lib/utils/dateFormatter';
import ReportsForm from './ReportsForm';

interface PageProps {
  searchParams: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Default to last 30 days if no dates provided
  const endDate = params.endDate
    ? new Date(params.endDate)
    : new Date();
  const startDate = params.startDate
    ? new Date(params.startDate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

  // Get reports
  const salesReportResult = await getSalesReport(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );
  const productReportResult = await getProductSalesReport(
    startDate.toISOString().split('T')[0],
    endDate.toISOString().split('T')[0]
  );

  const salesReport = salesReportResult.success && salesReportResult.data
    ? salesReportResult.data
    : [];
  const productReport = productReportResult.success && productReportResult.data
    ? productReportResult.data
    : [];

  // Calculate totals
  const totalRevenue = salesReport.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesReport.reduce((sum, item) => sum + item.orders, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Raporlar</h1>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          }>
            <ReportsForm
              defaultStartDate={startDate.toISOString().split('T')[0]}
              defaultEndDate={endDate.toISOString().split('T')[0]}
            />
          </Suspense>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Toplam Gelir</div>
            <div className="text-3xl font-bold text-green-600">
              {totalRevenue.toFixed(2)} ₺
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Toplam Sipariş</div>
            <div className="text-3xl font-bold text-blue-600">{totalOrders}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-500 text-sm mb-2">Ortalama Sipariş Tutarı</div>
            <div className="text-3xl font-bold text-purple-600">
              {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'} ₺
            </div>
          </div>
        </div>

        {/* Sales Report by Date */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Günlük Satış Raporu</h2>
          {salesReport.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tarih</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sipariş Sayısı</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gelir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {salesReport.map((item) => (
                    <tr key={item.date}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDateToTurkeyShort(item.date)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.orders}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {item.revenue.toFixed(2)} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Seçilen tarih aralığında satış bulunmamaktadır.</p>
          )}
        </div>

        {/* Product Sales Report */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ürün Satış Raporu</h2>
          {productReport.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ürün Adı</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Satılan Adet</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Toplam Gelir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {productReport.map((item) => (
                    <tr key={item.productId}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.totalSold}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {item.totalRevenue.toFixed(2)} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">Seçilen tarih aralığında ürün satışı bulunmamaktadır.</p>
          )}
        </div>
      </div>
    </div>
  );
}

