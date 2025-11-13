'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toggleCategoryActive } from '@/app/server-actions/categoryActions';

interface ToggleCategoryActiveButtonProps {
  categoryId: number;
  isActive: boolean;
  categoryName: string;
}

export default function ToggleCategoryActiveButton({
  categoryId,
  isActive: initialIsActive,
  categoryName,
}: ToggleCategoryActiveButtonProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (loading) return;

    const confirmMessage = isActive
      ? `"${categoryName}" kategorisini pasif yapmak istediğinize emin misiniz? Pasif kategoriler sitede görünmeyecektir.`
      : `"${categoryName}" kategorisini aktif yapmak istediğinize emin misiniz?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    const result = await toggleCategoryActive(categoryId, !isActive);
    if (result.success) {
      setIsActive(!isActive);
      router.refresh();
    } else {
      alert(result.error || 'Kategori durumu güncellenirken bir hata oluştu.');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        isActive
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-red-100 text-red-800 hover:bg-red-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Güncelleniyor...' : isActive ? 'Aktif' : 'Pasif'}
    </button>
  );
}

