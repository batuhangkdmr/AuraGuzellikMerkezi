'use client';

import { useState, useEffect, useMemo } from 'react';
import { Category } from '@/lib/repositories/CategoryRepository';
import { AttributeWithValues } from '@/lib/repositories/AttributeRepository';

interface AdvancedProductFiltersProps {
  categories: Category[];
  attributes: AttributeWithValues[];
  brands: Array<{ brand: string; count: number }>;
  selectedFilters: {
    categories: string[];
    brands: string[];
    priceRange: { min: number; max: number };
    attributes: Record<string, string[]>; // attributeSlug -> valueSlug[]
  };
  onFilterChange: (filters: {
    categories: string[];
    brands: string[];
    priceRange: { min: number; max: number };
    attributes: Record<string, string[]>;
  }) => void;
  onReset: () => void;
}

interface FilterSectionProps {
  title: string;
  isOpen?: boolean;
  children: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

function FilterSection({ title, isOpen: initialOpen = true, children, searchable, searchPlaceholder, onSearch }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-left"
      >
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-3">
          {searchable && (
            <input
              type="text"
              placeholder={searchPlaceholder || `${title} Ara`}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-900"
            />
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export default function AdvancedProductFilters({
  categories,
  attributes,
  brands,
  selectedFilters,
  onFilterChange,
  onReset,
}: AdvancedProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState(selectedFilters.priceRange);
  const [brandSearch, setBrandSearch] = useState('');
  const [attributeSearches, setAttributeSearches] = useState<Record<string, string>>({});

  // Flatten categories for display
  const flattenCategories = (cats: Category[], level: number = 0): Array<Category & { level: number }> => {
    let result: Array<Category & { level: number }> = [];
    cats.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  const flatCategories = flattenCategories(categories);

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    const query = brandSearch.toLowerCase();
    return brands.filter(b => b.brand.toLowerCase().includes(query));
  }, [brands, brandSearch]);

  // Filter attribute values by search
  const getFilteredAttributeValues = (attributeSlug: string, values: typeof attributes[0]['values']) => {
    const searchQuery = attributeSearches[attributeSlug]?.toLowerCase() || '';
    if (!searchQuery) return values;
    return values.filter(v => v.value.toLowerCase().includes(searchQuery));
  };

  const handleCategoryToggle = (categorySlug: string) => {
    const newCategories = selectedFilters.categories.includes(categorySlug)
      ? selectedFilters.categories.filter(c => c !== categorySlug)
      : [...selectedFilters.categories, categorySlug];
    
    onFilterChange({
      ...selectedFilters,
      categories: newCategories,
    });
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedFilters.brands.includes(brand)
      ? selectedFilters.brands.filter(b => b !== brand)
      : [...selectedFilters.brands, brand];
    
    onFilterChange({
      ...selectedFilters,
      brands: newBrands,
    });
  };

  const handleAttributeValueToggle = (attributeSlug: string, valueSlug: string) => {
    const currentValues = selectedFilters.attributes[attributeSlug] || [];
    const newValues = currentValues.includes(valueSlug)
      ? currentValues.filter(v => v !== valueSlug)
      : [...currentValues, valueSlug];
    
    onFilterChange({
      ...selectedFilters,
      attributes: {
        ...selectedFilters.attributes,
        [attributeSlug]: newValues,
      },
    });
  };

  const handlePriceRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      ...selectedFilters,
      priceRange: localPriceRange,
    });
  };

  // Predefined price ranges
  const priceRanges = [
    { label: '0 TL - 500 TL', min: 0, max: 500 },
    { label: '500 TL - 1000 TL', min: 500, max: 1000 },
    { label: '1000 TL - 2000 TL', min: 1000, max: 2000 },
    { label: '2000 TL - 5000 TL', min: 2000, max: 5000 },
    { label: '5000 TL - 10000 TL', min: 5000, max: 10000 },
    { label: '10000 TL ve üzeri', min: 10000, max: 999999 },
  ];

  const handlePriceRangeSelect = (min: number, max: number) => {
    const newRange = { min, max };
    setLocalPriceRange(newRange);
    onFilterChange({
      ...selectedFilters,
      priceRange: newRange,
    });
  };

  // Get color attribute
  const colorAttribute = attributes.find(attr => attr.slug === 'renk' && attr.type === 'color');

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-base">Filtreler</h3>
        <button
          onClick={onReset}
          className="text-sm text-primary-blue hover:text-primary-blue-dark font-medium"
        >
          Temizle
        </button>
      </div>

      <div className="space-y-0">
        {/* Category Filter */}
        {flatCategories.length > 0 && (
          <FilterSection title="Kategori">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {flatCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-2 cursor-pointer py-1"
                  style={{ paddingLeft: `${category.level * 16}px` }}
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.categories.includes(category.slug)}
                    onChange={() => handleCategoryToggle(category.slug)}
                    className="w-4 h-4 text-primary-blue focus:ring-primary-blue rounded"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Brand Filter */}
        {brands.length > 0 && (
          <FilterSection 
            title="Marka" 
            searchable 
            searchPlaceholder="Marka Ara"
            onSearch={setBrandSearch}
          >
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredBrands.map((brandItem) => (
                <label
                  key={brandItem.brand}
                  className="flex items-center space-x-2 cursor-pointer py-1"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.brands.includes(brandItem.brand)}
                    onChange={() => handleBrandToggle(brandItem.brand)}
                    className="w-4 h-4 text-primary-blue focus:ring-primary-blue rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {brandItem.brand}
                    {brandItem.count > 0 && (
                      <span className="text-gray-400 ml-1">({brandItem.count})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range Filter */}
        <FilterSection title="Fiyat">
          <form onSubmit={handlePriceRangeSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="En Az"
                value={localPriceRange.min || ''}
                onChange={(e) =>
                  setLocalPriceRange({ ...localPriceRange, min: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-900"
                min="0"
              />
              <span className="self-center text-gray-400">-</span>
              <input
                type="number"
                placeholder="En Çok"
                value={localPriceRange.max || ''}
                onChange={(e) =>
                  setLocalPriceRange({ ...localPriceRange, max: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-900"
                min="0"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-primary-blue text-white rounded-md hover:bg-primary-blue-dark transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <label
                  key={range.label}
                  className="flex items-center space-x-2 cursor-pointer py-1"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={localPriceRange.min === range.min && localPriceRange.max === range.max}
                    onChange={() => handlePriceRangeSelect(range.min, range.max)}
                    className="w-4 h-4 text-primary-blue focus:ring-primary-blue"
                  />
                  <span className="text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          </form>
        </FilterSection>

        {/* Color Filter */}
        {colorAttribute && colorAttribute.values.length > 0 && (
          <FilterSection title="Renk">
            <div className="grid grid-cols-4 gap-3">
              {getFilteredAttributeValues('renk', colorAttribute.values).map((value) => (
                <label
                  key={value.id}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.attributes['renk']?.includes(value.slug) || false}
                    onChange={() => handleAttributeValueToggle('renk', value.slug)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-full border-2 mb-1 ${
                      selectedFilters.attributes['renk']?.includes(value.slug)
                        ? 'border-primary-blue ring-2 ring-pink-200'
                        : 'border-gray-300'
                    }`}
                    style={{
                      backgroundColor: value.colorCode || '#ccc',
                    }}
                    title={value.value}
                  />
                  <span className="text-xs text-gray-600 text-center">{value.value}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Other Attributes */}
        {attributes
          .filter(attr => attr.slug !== 'renk') // Color is handled separately
          .map((attribute) => {
            const filteredValues = getFilteredAttributeValues(attribute.slug, attribute.values);
            if (filteredValues.length === 0) return null;

            return (
              <FilterSection
                key={attribute.id}
                title={attribute.name}
                searchable
                searchPlaceholder={`${attribute.name} Ara`}
                onSearch={(query) => {
                  setAttributeSearches(prev => ({ ...prev, [attribute.slug]: query }));
                }}
              >
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredValues.map((value) => (
                    <label
                      key={value.id}
                      className="flex items-center space-x-2 cursor-pointer py-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFilters.attributes[attribute.slug]?.includes(value.slug) || false}
                        onChange={() => handleAttributeValueToggle(attribute.slug, value.slug)}
                        className="w-4 h-4 text-primary-blue focus:ring-primary-blue rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {value.value}
                        {value.productCount !== undefined && value.productCount > 0 && (
                          <span className="text-gray-400 ml-1">({value.productCount})</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            );
          })}
      </div>
    </div>
  );
}

