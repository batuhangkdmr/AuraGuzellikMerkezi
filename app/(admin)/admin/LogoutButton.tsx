// Logout Button - Client Component
'use client';

import { logoutUser } from '@/app/auth/actions';

export default function LogoutButton() {
  const handleLogout = async () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      await logoutUser();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-semibold"
    >
      Çıkış Yap
    </button>
  );
}

