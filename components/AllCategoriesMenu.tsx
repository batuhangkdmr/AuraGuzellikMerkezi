'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/repositories/CategoryRepository';

interface AllCategoriesMenuProps {
  categories: Category[];
}

export default function AllCategoriesMenu({ categories }: AllCategoriesMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get all main categories (parent_id IS NULL)
  const mainCategories = categories.filter(cat => cat.parentId === null);

  // Note: We only show main categories in the sidebar, not all flattened categories

  if (mainCategories.length === 0) {
    return null;
  }

  const handleCategoryHover = (category: Category) => {
    setSelectedCategory(category);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    // Small delay to allow moving to mega menu
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setSelectedCategory(null);
    }, 200);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* TÜM KATEGORİLER Button - White Text */}
      <button className="flex items-center space-x-2 px-5 py-3 text-sm font-bold text-white hover:bg-primary-blue-dark hover:text-accent-yellow transition-all border-r-2 border-white/20 h-full">
        <svg
          className="w-5 h-5"
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
        <span>TÜM KATEGORİLER</span>
      </button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div 
          className="fixed top-[calc(80px+48px)] left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-[100]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="container mx-auto px-4">
            <div className="flex">
            {/* Left Sidebar - Only Main Categories (No Sub/Child) */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 max-h-[600px] overflow-y-auto">
              <div className="p-2">
                {mainCategories.map((category) => {
                  const isSelected = selectedCategory?.id === category.id;
                  const hasChildren = category.children && category.children.length > 0;

                  return (
                    <div
                      key={category.id}
                      className={`relative ${
                        isSelected ? 'bg-white shadow-sm' : ''
                      }`}
                      onMouseEnter={() => handleCategoryHover(category)}
                    >
                      {/* Main Category Only */}
                      <Link
                        href={`/products?category=${category.slug}`}
                        className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                          isSelected
                            ? 'text-primary-blue font-medium'
                            : 'text-gray-700 hover:text-primary-blue hover:bg-white'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          {category.image && (
                            <div className="relative w-6 h-6 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-cover"
                                sizes="24px"
                              />
                            </div>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </span>
                        {hasChildren && (
                          <svg
                            className="w-4 h-4 text-gray-400"
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
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Side - Mega Menu Content (Only Categories, No Products) */}
            {selectedCategory && (
              <div className="flex-1 p-6 max-h-[600px] overflow-y-auto">
                {/* Selected Category Header */}
                <div className="mb-4 pb-3 border-b border-gray-200">
                  <Link
                    href={`/products?category=${selectedCategory.slug}`}
                    className="text-xl font-bold text-gray-900 hover:text-primary-blue transition-colors"
                  >
                    {selectedCategory.name}
                  </Link>
                </div>

                {/* If selected category has subcategories, show them */}
                {selectedCategory.children && selectedCategory.children.length > 0 ? (
                  <div className="grid grid-cols-4 gap-6">
                    {selectedCategory.children.map((subcategory) => (
                      <div key={subcategory.id} className="space-y-3">
                        {/* Subcategory Header */}
                        <Link
                          href={`/products?category=${subcategory.slug}`}
                          className="block font-semibold text-gray-900 hover:text-primary-blue transition-colors text-sm border-b border-gray-200 pb-2"
                        >
                          {subcategory.name}
                        </Link>

                        {/* Child Categories */}
                        {subcategory.children && subcategory.children.length > 0 && (
                          <ul className="space-y-1.5 mt-2">
                            {subcategory.children.map((childCategory) => (
                              <li key={childCategory.id}>
                                <Link
                                  href={`/products?category=${childCategory.slug}`}
                                  className="block text-xs text-gray-600 hover:text-primary-blue transition-colors py-1"
                                >
                                  {childCategory.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* If selected category has no subcategories, show message */
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">
                      Bu kategorinin alt kategorisi bulunmamaktadır.
                    </p>
                    <Link
                      href={`/products?category=${selectedCategory.slug}`}
                      className="mt-4 inline-block text-primary-blue hover:text-primary-blue-dark text-sm font-medium"
                    >
                      {selectedCategory.name} kategorisindeki ürünleri görüntüle →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Default Message if no category selected */}
            {!selectedCategory && (
              <div className="flex-1 p-6 flex items-center justify-center">
                <p className="text-gray-400 text-sm">
                  Bir kategori seçin
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

