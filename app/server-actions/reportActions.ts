'use server';

import { ReportRepository } from '@/lib/repositories/ReportRepository';
import { requireUser } from '@/lib/requireUser';

export interface ActionResponse<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Get dashboard statistics (admin only)
 */
export async function getDashboardStats() {
  try {
    await requireUser('ADMIN');
    const stats = await ReportRepository.getDashboardStats();
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return {
      success: false,
      error: 'İstatistikler yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get sales report by date range (admin only)
 */
export async function getSalesReport(startDate: string, endDate: string) {
  try {
    await requireUser('ADMIN');
    const start = new Date(startDate);
    const end = new Date(endDate);
    const report = await ReportRepository.getSalesReport(start, end);
    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error('Get sales report error:', error);
    return {
      success: false,
      error: 'Rapor yüklenirken bir hata oluştu',
    };
  }
}

/**
 * Get product sales report (admin only)
 */
export async function getProductSalesReport(startDate?: string, endDate?: string) {
  try {
    await requireUser('ADMIN');
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    const report = await ReportRepository.getProductSalesReport(start, end);
    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error('Get product sales report error:', error);
    return {
      success: false,
      error: 'Ürün satış raporu yüklenirken bir hata oluştu',
    };
  }
}

