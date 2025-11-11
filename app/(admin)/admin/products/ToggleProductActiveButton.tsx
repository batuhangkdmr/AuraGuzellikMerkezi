'use client';

import { useState } from 'react';
import { toggleProductActive } from '@/app/server-actions/productActions';
import { useRouter } from 'next/navigation';

interface ToggleProductActiveButtonProps {
  productId: number;
  isActive: boolean;
  productName: string;
}

export default function ToggleProductActiveButton({
  productId,
  isActive,
  productName,
}: ToggleProductActiveButtonProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;

    const action = isActive ? 'pasif' : 'aktif';
    if (!confirm(`${productName} ürününü ${action} yapmak istediğinize emin misiniz?`)) {
      return;
    }

    setIsToggling(true);
    try {
      const result = await toggleProductActive(productId, !isActive);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Durum güncellenirken bir hata oluştu');
      }
    } catch (error) {
      alert('Durum güncellenirken bir hata oluştu');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
        isActive
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isActive ? 'Ürünü pasif yap' : 'Ürünü aktif yap'}
    >
      {isToggling ? '...' : isActive ? 'Aktif' : 'Pasif'}
    </button>
  );
}

