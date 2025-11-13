import 'server-only';

import { executeQuery, executeQueryOne } from '../db';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  thisMonthOrders: number;
  thisMonthRevenue: number;
  statusDistribution: {
    status: string;
    count: number;
  }[];
}

export interface SalesReport {
  date: string;
  orders: number;
  revenue: number;
}

export interface ProductSalesReport {
  productId: number;
  productName: string;
  totalSold: number;
  totalRevenue: number;
}

export class ReportRepository {
  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    // Get total orders and revenue
    const totalStats = await executeQueryOne<{
      totalOrders: number;
      totalRevenue: number;
    }>(
      `SELECT 
        COUNT(*) as totalOrders,
        ISNULL(SUM(CASE WHEN status != 'CANCELLED' THEN total ELSE 0 END), 0) as totalRevenue
       FROM orders`
    );

    // Get pending orders
    const pendingStats = await executeQueryOne<{
      pendingOrders: number;
    }>(
      `SELECT COUNT(*) as pendingOrders
       FROM orders
       WHERE status IN ('PENDING', 'CONFIRMED')`
    );

    // Get today's orders and revenue
    const todayStats = await executeQueryOne<{
      todayOrders: number;
      todayRevenue: number;
    }>(
      `SELECT 
        COUNT(*) as todayOrders,
        ISNULL(SUM(CASE WHEN status != 'CANCELLED' THEN total ELSE 0 END), 0) as todayRevenue
       FROM orders
       WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)`
    );

    // Get this month's orders and revenue
    const thisMonthStats = await executeQueryOne<{
      thisMonthOrders: number;
      thisMonthRevenue: number;
    }>(
      `SELECT 
        COUNT(*) as thisMonthOrders,
        ISNULL(SUM(CASE WHEN status != 'CANCELLED' THEN total ELSE 0 END), 0) as thisMonthRevenue
       FROM orders
       WHERE YEAR(created_at) = YEAR(GETDATE())
       AND MONTH(created_at) = MONTH(GETDATE())`
    );

    // Get status distribution
    const statusDistribution = await executeQuery<{
      status: string;
      count: number;
    }>(
      `SELECT status, COUNT(*) as count
       FROM orders
       GROUP BY status
       ORDER BY count DESC`
    );

    return {
      totalOrders: totalStats?.totalOrders || 0,
      totalRevenue: parseFloat(totalStats?.totalRevenue?.toString() || '0'),
      pendingOrders: pendingStats?.pendingOrders || 0,
      todayOrders: todayStats?.todayOrders || 0,
      todayRevenue: parseFloat(todayStats?.todayRevenue?.toString() || '0'),
      thisMonthOrders: thisMonthStats?.thisMonthOrders || 0,
      thisMonthRevenue: parseFloat(thisMonthStats?.thisMonthRevenue?.toString() || '0'),
      statusDistribution: statusDistribution || [],
    };
  }

  // Get sales report by date range
  static async getSalesReport(startDate: Date, endDate: Date): Promise<SalesReport[]> {
    const results = await executeQuery<{
      date: string;
      orders: number;
      revenue: number;
    }>(
      `SELECT 
        CAST(created_at AS DATE) as date,
        COUNT(*) as orders,
        ISNULL(SUM(CASE WHEN status != 'CANCELLED' THEN total ELSE 0 END), 0) as revenue
       FROM orders
       WHERE CAST(created_at AS DATE) >= CAST(@startDate AS DATE)
       AND CAST(created_at AS DATE) <= CAST(@endDate AS DATE)
       GROUP BY CAST(created_at AS DATE)
       ORDER BY date ASC`,
      {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      }
    );

    return results.map(item => ({
      date: item.date,
      orders: item.orders,
      revenue: parseFloat(item.revenue?.toString() || '0'),
    }));
  }

  // Get product sales report
  static async getProductSalesReport(startDate?: Date, endDate?: Date): Promise<ProductSalesReport[]> {
    let query = `
      SELECT 
        oi.product_id as productId,
        oi.name_snapshot as productName,
        SUM(oi.quantity) as totalSold,
        SUM(oi.price_snapshot * oi.quantity) as totalRevenue
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'CANCELLED'
    `;

    const params: Record<string, any> = {};

    if (startDate && endDate) {
      query += `
        AND CAST(o.created_at AS DATE) >= CAST(@startDate AS DATE)
        AND CAST(o.created_at AS DATE) <= CAST(@endDate AS DATE)
      `;
      params.startDate = startDate.toISOString().split('T')[0];
      params.endDate = endDate.toISOString().split('T')[0];
    }

    query += `
      GROUP BY oi.product_id, oi.name_snapshot
      ORDER BY totalSold DESC
    `;

    const results = await executeQuery<{
      productId: number;
      productName: string;
      totalSold: number;
      totalRevenue: number;
    }>(query, Object.keys(params).length > 0 ? params : undefined);

    return results.map(item => ({
      productId: item.productId || 0,
      productName: item.productName,
      totalSold: item.totalSold,
      totalRevenue: parseFloat(item.totalRevenue?.toString() || '0'),
    }));
  }
}

