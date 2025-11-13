'use client';

import { useState } from 'react';
import { Category } from '@/lib/repositories/CategoryRepository';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: string;
  priceRange: { min: number; max: number };
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onReset: () => void;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  priceRange,
  onCategoryChange,
  onPriceRangeChange,
  onReset,
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  // Flatten categories for display
  const flattenCategories = (cats: Category[], level: number = 0): Array<Category & { level: number; displayName: string }> => {
    let result: Array<Category & { level: number; displayName: string }> = [];
    cats.forEach((cat) => {
      result.push({ ...cat, level, displayName: '  '.repeat(level) + cat.name });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  const handlePriceRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPriceRangeChange(localPriceRange.min, localPriceRange.max);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filtreler</h3>
        <button
          onClick={onReset}
          className="text-sm text-pink-600 hover:text-pink-700"
        >
          Temizle
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Kategoriler</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {flatCategories.map((category) => (
            <label
              key={category.id}
              className="flex items-center space-x-2 cursor-pointer"
              style={{ paddingLeft: `${category.level * 16}px` }}
            >
              <input
                type="radio"
                name="category"
                value={category.slug}
                checked={selectedCategory === category.slug}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-4 h-4 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">{category.displayName}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Fiyat Aralığı</h4>
        <form onSubmit={handlePriceRangeSubmit} className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={localPriceRange.min || ''}
              onChange={(e) =>
                setLocalPriceRange({ ...localPriceRange, min: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
            />
            <input
              type="number"
              placeholder="Max"
              value={localPriceRange.max || ''}
              onChange={(e) =>
                setLocalPriceRange({ ...localPriceRange, max: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min="0"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition-colors text-sm"
          >
            Uygula
          </button>
        </form>
      </div>

      {/* Stock Filter */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Stok Durumu</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Stokta var</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Stokta yok</span>
          </label>
        </div>
      </div>
    </div>
  );
}

