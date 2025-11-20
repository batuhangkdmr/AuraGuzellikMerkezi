'use client';

import { useState } from 'react';
import { deleteUser } from '@/app/server-actions/userActions';
import { showToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';

interface DeleteUserButtonProps {
  userId: number;
  userName: string;
}

export default function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (isDeleting) return;
    
    if (!confirm(`"${userName}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteUser(userId);
      
      if (result.success) {
        showToast('Kullanıcı başarıyla silindi', 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Kullanıcı silinirken bir hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      showToast('Kullanıcı silinirken bir hata oluştu', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-4 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-lg text-sm font-semibold transition-all border-2 border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Kullanıcıyı Sil"
    >
      {isDeleting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Siliniyor...
        </span>
      ) : (
        '🗑️ Sil'
      )}
    </button>
  );
}

