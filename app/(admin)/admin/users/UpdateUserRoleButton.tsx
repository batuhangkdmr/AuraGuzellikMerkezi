'use client';

import { useState } from 'react';
import { updateUserRole } from '@/app/server-actions/userActions';
import { UserRole } from '@/lib/types/UserRole';
import { showToast } from '@/components/ToastContainer';
import { useRouter } from 'next/navigation';

interface UpdateUserRoleButtonProps {
  userId: number;
  currentRole: UserRole;
}

export default function UpdateUserRoleButton({ userId, currentRole }: UpdateUserRoleButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleRoleChange = async () => {
    if (isUpdating) return;
    
    const newRole = currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    const confirmMessage = newRole === UserRole.ADMIN 
      ? 'Bu kullanıcıyı yönetici yapmak istediğinizden emin misiniz?'
      : 'Bu kullanıcının yönetici yetkisini kaldırmak istediğinizden emin misiniz?';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateUserRole(userId, newRole);
      
      if (result.success) {
        showToast(`Kullanıcı rolü başarıyla güncellendi`, 'success');
        router.refresh();
      } else {
        showToast(result.error || 'Rol güncellenirken bir hata oluştu', 'error');
      }
    } catch (error) {
      console.error('Update role error:', error);
      showToast('Rol güncellenirken bir hata oluştu', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={handleRoleChange}
      disabled={isUpdating}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        currentRole === UserRole.ADMIN
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-2 border-yellow-300'
          : 'bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-300'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={currentRole === UserRole.ADMIN ? 'Yönetici yetkisini kaldır' : 'Yönetici yap'}
    >
      {isUpdating ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Güncelleniyor...
        </span>
      ) : (
        currentRole === UserRole.ADMIN ? '👤 Kullanıcı Yap' : '👑 Yönetici Yap'
      )}
    </button>
  );
}

