'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAttribute } from '@/app/server-actions/attributeActions';

interface ToggleAttributeActiveButtonProps {
  id: number;
  isActive: boolean;
}

export default function ToggleAttributeActiveButton({
  id,
  isActive: initialIsActive,
}: ToggleAttributeActiveButtonProps) {
  const [isActive, setIsActive] = useState(initialIsActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('isActive', (!isActive).toString());
    
    const result = await updateAttribute(id, formData);
    if (result.success) {
      setIsActive(!isActive);
      router.refresh();
    } else {
      alert(result.error || 'Özellik durumu güncellenirken bir hata oluştu.');
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

