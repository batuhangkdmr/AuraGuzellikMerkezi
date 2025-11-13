'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCategory } from '@/app/server-actions/categoryActions';

interface DeleteCategoryButtonProps {
  categoryId: number;
  categoryName: string;
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
}: DeleteCategoryButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`"${categoryName}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setLoading(true);
    const result = await deleteCategory(categoryId);
    
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || 'Kategori silinirken bir hata oluştu.');
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

