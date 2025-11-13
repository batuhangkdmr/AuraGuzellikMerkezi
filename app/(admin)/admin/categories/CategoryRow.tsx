'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DeleteCategoryButton from './DeleteCategoryButton';
import ToggleCategoryActiveButton from './ToggleCategoryActiveButton';

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  parentId: number | null;
  children?: Category[];
}

interface CategoryRowProps {
  category: Category;
  level: number;
  parentName: string | null;
}

export default function CategoryRow({ category, level, parentName }: CategoryRowProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0); // Ana kategoriler varsayılan olarak açık
  const hasChildren = category.children && category.children.length > 0;
  const indent = level * 32; // 32px per level

  // Level indicators
  const levelColors = [
    'border-l-4 border-blue-500', // Level 0 (Main category)
    'border-l-4 border-green-500', // Level 1 (Subcategory)
    'border-l-4 border-purple-500', // Level 2 (Child category)
  ];
  const levelColor = levelColors[level] || 'border-l-4 border-gray-400';

  const levelLabels = ['Ana Kategori', 'Alt Kategori', 'Alt Alt Kategori'];
  const levelLabel = levelLabels[level] || `Seviye ${level + 1}`;

  return (
    <>
      <tr className={`hover:bg-gray-50 ${levelColor} ${!category.isActive ? 'opacity-60' : ''}`}>
        <td className="px-6 py-4" style={{ paddingLeft: `${16 + indent}px` }}>
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
                aria-label={isExpanded ? 'Kapat' : 'Aç'}
              >
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            {!hasChildren && <div className="w-6" />} {/* Spacer for alignment */}

            {/* Level indicator */}
            <div className="flex flex-col items-center min-w-[60px]">
              {level === 0 && <span className="text-2xl">📁</span>}
              {level === 1 && <span className="text-xl">📂</span>}
              {level === 2 && <span className="text-lg">📄</span>}
              <span className="text-xs text-gray-500 mt-1">{levelLabel}</span>
            </div>

            {/* Category name and parent info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span
                  className={`font-medium ${
                    level === 0
                      ? 'text-lg text-gray-900'
                      : level === 1
                      ? 'text-base text-gray-800'
                      : 'text-sm text-gray-700'
                  }`}
                >
                  {category.name}
                </span>
                {hasChildren && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {category.children!.length} alt kategori
                  </span>
                )}
              </div>
              {parentName && (
                <div className="text-xs text-gray-500 mt-1">
                  <span className="text-gray-400">←</span> Üst kategori:{' '}
                  <span className="font-medium">{parentName}</span>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
        </td>
        <td className="px-6 py-4">
          {category.image ? (
            <div className="relative h-16 w-16 border-2 border-gray-200 rounded-lg overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-400">Görsel yok</span>
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm font-medium text-gray-600">{category.displayOrder}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <ToggleCategoryActiveButton
            categoryId={category.id}
            isActive={category.isActive}
            categoryName={category.name}
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="text-pink-600 hover:text-pink-900 font-medium"
          >
            Düzenle
          </Link>
          <span className="text-gray-300">|</span>
          <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
        </td>
      </tr>
      {hasChildren &&
        isExpanded &&
        category.children!.map((child) => (
          <CategoryRow key={child.id} category={child} level={level + 1} parentName={category.name} />
        ))}
    </>
  );
}

