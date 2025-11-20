'use client';

import Link from 'next/link';
import { getFavorites } from '@/app/server-actions/favoriteActions';
import { useEffect, useState } from 'react';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';
import { useCompare } from '@/app/context/CompareContext';

interface NavbarClientProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [favoriteCount, setFavoriteCount] = useState(0);
  const { compareItems } = useCompare();

  useEffect(() => {
    const loadFavoriteCount = async () => {
      try {
        const result = await getFavorites();
        if (result.success && result.data) {
          setFavoriteCount(result.data.length);
        }
      } catch (error) {
        console.error('Error loading favorite count:', error);
      }
    };

    loadFavoriteCount();
  }, []);

  return (
    <div className="flex items-center gap-2 lg:gap-3">
      {/* Bildirimler */}
      <NotificationBell />

      {/* Karşılaştırma */}
      <Link
        href="/compare"
        className="relative flex items-center justify-center p-2 lg:px-3 lg:py-2 text-white hover:text-accent-yellow transition-all group rounded-lg hover:bg-primary-blue-dark"
        title="Ürün Karşılaştırma"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        <span className="hidden lg:inline lg:ml-2 text-sm font-semibold">Karşılaştır</span>
        {compareItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-yellow text-primary-blue-dark text-[10px] rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center font-bold shadow-lg">
            {compareItems.length}
          </span>
        )}
      </Link>

      {/* Siparişlerim */}
      <Link
        href="/profile/orders"
        className="relative flex items-center justify-center p-2 lg:px-3 lg:py-2 text-white hover:text-accent-yellow transition-all group rounded-lg hover:bg-primary-blue-dark"
        title="Siparişlerim"
      >
        <svg
          className="w-5 h-5 lg:w-5 lg:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span className="hidden lg:inline lg:ml-2 text-sm font-semibold">Siparişlerim</span>
      </Link>

      {/* Favorilerim */}
      <Link
        href="/favorites"
        className="relative flex items-center justify-center p-2 lg:px-3 lg:py-2 text-white hover:text-accent-yellow transition-all group rounded-lg hover:bg-primary-blue-dark"
        title="Favorilerim"
      >
        <svg
          className="w-5 h-5 lg:w-5 lg:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span className="hidden lg:inline lg:ml-2 text-sm font-semibold">Favorilerim</span>
        {favoriteCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-yellow text-primary-blue-dark text-[10px] rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center font-bold shadow-lg">
            {favoriteCount > 99 ? '99+' : favoriteCount}
          </span>
        )}
      </Link>

      {/* Sepetim */}
      <Link
        href="/cart"
        className="relative flex items-center justify-center p-2 lg:px-3 lg:py-2 text-white hover:text-accent-yellow transition-all group rounded-lg hover:bg-primary-blue-dark"
        title="Sepetim"
      >
        <svg
          className="w-5 h-5 lg:w-5 lg:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span className="hidden lg:inline lg:ml-2 text-sm font-semibold">Sepetim</span>
      </Link>

      {/* User Menu */}
      <div className="hidden lg:block ml-2">
        <UserMenu userName={user.name} userRole={user.role} />
      </div>
    </div>
  );
}

