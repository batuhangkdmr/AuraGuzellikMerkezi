'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface ReportsFormProps {
  defaultStartDate: string;
  defaultEndDate: string;
}

export default function ReportsForm({ defaultStartDate, defaultEndDate }: ReportsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set('startDate', startDate);
    params.set('endDate', endDate);
    router.push(`/admin/reports?${params.toString()}`);
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const params = new URLSearchParams();
    params.set('startDate', start.toISOString().split('T')[0]);
    params.set('endDate', end.toISOString().split('T')[0]);
    router.push(`/admin/reports?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Tarih Aralığı Seçin</h2>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleQuickFilter(7)}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Son 7 Gün
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter(30)}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Son 30 Gün
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter(90)}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Son 90 Gün
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter(365)}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Son 1 Yıl
        </button>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
            required
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
          >
            Raporu Getir
          </button>
        </div>
      </div>
    </form>
  );
}

