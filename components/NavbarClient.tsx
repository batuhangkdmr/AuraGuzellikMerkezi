'use client';

import Link from 'next/link';
import { getFavorites } from '@/app/server-actions/favoriteActions';
import { useEffect, useState } from 'react';
import UserMenu from './UserMenu';

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
    <>
      {/* Favorilerim */}
      <Link
        href="/favorites"
        className="relative flex items-center justify-center p-2 text-gray-700 hover:text-pink-600 transition group rounded-lg hover:bg-gray-100"
        title="Favorilerim"
      >
        <svg
          className="w-6 h-6 lg:w-5 lg:h-5"
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
        <span className="hidden lg:inline lg:ml-1 text-sm">Favorilerim</span>
        {favoriteCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-pink-600 text-white text-[10px] rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center font-semibold">
            {favoriteCount > 99 ? '99+' : favoriteCount}
          </span>
        )}
      </Link>

      {/* Sepetim */}
      <Link
        href="/cart"
        className="relative flex items-center justify-center p-2 text-gray-700 hover:text-pink-600 transition group rounded-lg hover:bg-gray-100"
        title="Sepetim"
      >
        <svg
          className="w-6 h-6 lg:w-5 lg:h-5"
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
        <span className="hidden lg:inline lg:ml-1 text-sm">Sepetim</span>
      </Link>

      {/* User Menu */}
      <div className="hidden lg:block">
        <UserMenu userName={user.name} userRole={user.role} />
      </div>
    </>
  );
}

