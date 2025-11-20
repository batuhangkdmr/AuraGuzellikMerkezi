'use client';

import { useState } from 'react';
import { Category } from '@/lib/repositories/CategoryRepository';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryIds: number[];
  onCategoryChange: (categoryIds: number[]) => void;
  primaryCategoryId?: number | null;
  onPrimaryCategoryChange?: (categoryId: number | null) => void;
}

export default function CategorySelector({
  categories,
  selectedCategoryIds,
  onCategoryChange,
  primaryCategoryId,
  onPrimaryCategoryChange,
}: CategorySelectorProps) {
  // Flatten category tree for display
  const flattenCategories = (cats: Category[], level: number = 0): Array<Category & { level: number; displayName: string; path: string }> => {
    let result: Array<Category & { level: number; displayName: string; path: string }> = [];
    cats.forEach((cat) => {
      const indent = '  '.repeat(level);
      const prefix = level === 0 ? '📁' : level === 1 ? '📂' : '📄';
      result.push({
        ...cat,
        level,
        displayName: `${prefix} ${indent}${cat.name}`,
        path: cat.name,
      });
      if (cat.children && cat.children.length > 0) {
        const children = flattenCategories(cat.children, level + 1);
        children.forEach(child => {
          child.path = `${cat.name} > ${child.path}`;
        });
        result = result.concat(children);
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const handleCategoryToggle = (categoryId: number) => {
    if (selectedCategoryIds.includes(categoryId)) {
      // Remove category
      const newIds = selectedCategoryIds.filter(id => id !== categoryId);
      onCategoryChange(newIds);
      // If it was the primary category, clear primary
      if (primaryCategoryId === categoryId && onPrimaryCategoryChange) {
        onPrimaryCategoryChange(null);
      }
    } else {
      // Add category
      const newIds = [...selectedCategoryIds, categoryId];
      onCategoryChange(newIds);
      // If no primary category is set, set this as primary
      if (!primaryCategoryId && onPrimaryCategoryChange) {
        onPrimaryCategoryChange(categoryId);
      }
    }
  };

  const handlePrimaryCategoryChange = (categoryId: number | null) => {
    if (onPrimaryCategoryChange) {
      onPrimaryCategoryChange(categoryId);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Kategoriler *
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Ürünü bir veya daha fazla kategoriye atayabilirsiniz. Birden fazla kategori seçebilirsiniz.
        </p>
        <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto bg-gray-50">
          {flatCategories.length === 0 ? (
            <p className="text-gray-500 text-sm">Henüz kategori bulunmamaktadır.</p>
          ) : (
            <div className="space-y-2">
              {flatCategories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="flex-1 text-sm cursor-pointer"
                    style={{ paddingLeft: `${category.level * 16}px` }}
                  >
                    <span className={selectedCategoryIds.includes(category.id) ? 'font-medium text-gray-900' : 'text-gray-700'}>
                      {category.displayName}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedCategoryIds.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {selectedCategoryIds.length} kategori seçildi
          </p>
        )}
      </div>

      {selectedCategoryIds.length > 0 && onPrimaryCategoryChange && (
        <div>
          <label htmlFor="primaryCategoryId" className="block text-gray-700 font-medium mb-2">
            Ana Kategori (Opsiyonel)
          </label>
          <select
            id="primaryCategoryId"
            name="primaryCategoryId"
            value={primaryCategoryId || ''}
            onChange={(e) => handlePrimaryCategoryChange(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-900"
          >
            <option value="">Ana kategori seçin (opsiyonel)</option>
            {flatCategories
              .filter(cat => selectedCategoryIds.includes(cat.id))
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.path}
                </option>
              ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Ana kategori, ürünün öncelikli olarak gösterileceği kategoridir. Seçilen kategorilerden biri olmalıdır.
          </p>
        </div>
      )}
    </div>
  );
}

