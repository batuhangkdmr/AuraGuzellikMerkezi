'use client';

import { deleteService } from './actions';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteButtonProps {
  id: number;
  title: string;
}

export default function DeleteButton({ id, title }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${title}" hizmetini silmek istediğinize emin misiniz?`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteService(id);
    
    if (result.success) {
      alert(result.message);
      router.refresh();
    } else {
      alert(result.error || 'Hizmet silinemedi');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? 'Siliniyor...' : 'Sil'}
    </button>
  );
}

