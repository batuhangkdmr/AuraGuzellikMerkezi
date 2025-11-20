'use client';

import { useState } from 'react';
import MobileMenu from './MobileMenu';
import { Category } from '@/lib/repositories/CategoryRepository';

interface NavbarMobileProps {
  categories: Category[];
}

export default function NavbarMobile({ categories }: NavbarMobileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsMenuOpen(true)}
        className="p-2 text-white hover:text-accent-yellow hover:bg-primary-blue-dark rounded-lg transition-colors"
        aria-label="Menüyü Aç"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <MobileMenu
        categories={categories}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}

