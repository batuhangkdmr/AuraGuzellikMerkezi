'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAttribute } from '@/app/server-actions/attributeActions';

interface DeleteAttributeButtonProps {
  id: number;
  name: string;
}

export default function DeleteAttributeButton({
  id,
  name,
}: DeleteAttributeButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`"${name}" özelliğini silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm değerleri de silinecektir.`)) {
      return;
    }

    setLoading(true);
    const result = await deleteAttribute(id);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Özellik silinirken bir hata oluştu.');
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Siliniyor...' : 'Sil'}
    </button>
  );
}

