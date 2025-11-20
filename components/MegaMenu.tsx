'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/lib/repositories/CategoryRepository';

interface MegaMenuProps {
  categories: Category[];
}

export default function MegaMenu({ categories }: MegaMenuProps) {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  // Only show main categories (parent_id IS NULL)
  const mainCategories = categories.filter(cat => cat.parentId === null);

  if (mainCategories.length === 0) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 overflow-x-auto h-full">
          {mainCategories.map((category) => {
            const hasChildren = category.children && category.children.length > 0;
            const isHovered = hoveredCategory === category.id;

            return (
              <div
                key={category.id}
                className="relative flex-shrink-0"
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className={`block px-4 py-3 text-sm font-medium transition-colors relative ${
                    isHovered 
                      ? 'text-accent-yellow border-b-2 border-accent-yellow' 
                      : 'text-white hover:text-accent-yellow'
                  }`}
                >
                  {category.name}
                  {hasChildren && (
                    <svg
                      className="inline-block ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </Link>

                {/* Mega Menu Dropdown */}
                {hasChildren && isHovered && (
                  <div className="fixed top-[calc(80px+48px)] left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-[100]">
                    <div className="container mx-auto px-4">
                      <div className="p-6">
                      {/* Category Header */}
                      <div className="mb-4 pb-3 border-b border-gray-200">
                        <Link
                          href={`/products?category=${category.slug}`}
                          className="text-xl font-bold text-gray-900 hover:text-primary-blue transition-colors"
                          onClick={() => setHoveredCategory(null)}
                        >
                          {category.name}
                        </Link>
                      </div>

                      {/* Grid Layout for Subcategories */}
                      <div className="grid grid-cols-5 gap-6">
                        {/* Subcategories */}
                        <div className="col-span-4 grid grid-cols-4 gap-6">
                          {category.children?.map((subcategory) => (
                            <div key={subcategory.id} className="space-y-3">
                              {/* Subcategory Header */}
                              <Link
                                href={`/products?category=${subcategory.slug}`}
                                className="block font-semibold text-gray-900 hover:text-primary-blue transition-colors text-sm border-b border-gray-200 pb-2"
                                onClick={() => setHoveredCategory(null)}
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
                                        onClick={() => setHoveredCategory(null)}
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
                        
                        {/* Category Image (if exists) */}
                        {category.image && (
                          <div className="col-span-1">
                            <Link
                              href={`/products?category=${category.slug}`}
                              onClick={() => setHoveredCategory(null)}
                            >
                              <div className="relative h-64 w-full rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  className="object-cover hover:scale-105 transition-transform duration-300"
                                  sizes="200px"
                                />
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
    </nav>
  );
}

