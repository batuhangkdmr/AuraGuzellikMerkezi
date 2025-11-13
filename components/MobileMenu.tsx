'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Category } from '@/lib/repositories/CategoryRepository';

interface MobileMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ categories, isOpen, onClose }: MobileMenuProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const mainCategories = categories.filter(cat => cat.parentId === null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Menü</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menüyü Kapat"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {mainCategories.map((category) => {
                const hasChildren = category.children && category.children.length > 0;
                const isActive = activeCategory === category.id;

                return (
                  <div key={category.id} className="mb-1">
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        isActive ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setActiveCategory(isActive ? null : category.id)}
                    >
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="flex-1 font-medium"
                        onClick={onClose}
                      >
                        {category.name}
                      </Link>
                      {hasChildren && (
                        <svg
                          className={`w-5 h-5 transition-transform ${
                            isActive ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Subcategories */}
                    {hasChildren && isActive && (
                      <div className="ml-4 mt-1 space-y-1">
                        {category.children?.map((subcategory) => (
                          <div key={subcategory.id}>
                            <Link
                              href={`/products?category=${subcategory.slug}`}
                              className="block p-2 text-sm text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                              onClick={onClose}
                            >
                              {subcategory.name}
                            </Link>
                            {/* Child categories */}
                            {subcategory.children && subcategory.children.length > 0 && (
                              <div className="ml-4 space-y-1">
                                {subcategory.children.map((child) => (
                                  <Link
                                    key={child.id}
                                    href={`/products?category=${child.slug}`}
                                    className="block p-2 text-xs text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                                    onClick={onClose}
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          <div className="border-t border-gray-200 p-4 space-y-2">
            <Link
              href="/hakkimizda"
              className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
              onClick={onClose}
            >
              Hakkımızda
            </Link>
            <Link
              href="/iletisim"
              className="block py-2 text-gray-700 hover:text-pink-600 transition-colors"
              onClick={onClose}
            >
              Yardım & Destek
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

