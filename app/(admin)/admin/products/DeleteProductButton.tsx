'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteProduct } from '@/app/server-actions/productActions';

interface DeleteProductButtonProps {
  productId: number;
  productName: string;
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProduct(productId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Ürün silinirken bir hata oluştu');
      }
    } catch (error) {
      alert('Ürün silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="text-sm text-gray-600">Emin misiniz?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-gray-600 hover:text-gray-800 text-sm"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-800 text-sm font-medium"
    >
      Sil
    </button>
  );
}

