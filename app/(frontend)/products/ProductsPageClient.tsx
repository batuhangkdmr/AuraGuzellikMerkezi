'use client';

import { useState, useMemo } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { Category } from '@/lib/repositories/CategoryRepository';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  description?: string;
}

interface ProductsPageClientProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
}

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function ProductsPageClient({
  products,
  categories,
  initialCategory,
}: ProductsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Filter products (category filtering is done server-side, we only do client-side filtering for price/sort)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filtering is done server-side via getAllProducts(categorySlug)
    // No need to filter by category here since it's already filtered

    // Filter by price range
    if (priceRange.min > 0 || priceRange.max > 0) {
      filtered = filtered.filter((product) => {
        if (priceRange.min > 0 && product.price < priceRange.min) return false;
        if (priceRange.max > 0 && product.price > priceRange.max) return false;
        return true;
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'popular':
        default:
          return 0; // Keep original order for popular
      }
    });

    return filtered;
  }, [products, priceRange, sortBy]);

  const handleCategoryChange = (category: string) => {
    const newCategory = category === selectedCategory ? undefined : category;
    setSelectedCategory(newCategory);
    // Update URL and reload to get filtered products from server
    const url = new URL(window.location.href);
    if (newCategory) {
      url.searchParams.set('category', newCategory);
    } else {
      url.searchParams.delete('category');
    }
    window.location.href = url.toString();
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
  };

  const handleReset = () => {
    setSelectedCategory(undefined);
    setPriceRange({ min: 0, max: 0 });
    setSortBy('popular');
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Ürünlerimiz</h1>
          <p className="text-lg opacity-90">Tüm ürünlerimizi keşfedin</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full bg-white rounded-lg shadow-sm p-4 flex items-center justify-between mb-4"
            >
              <span className="font-medium">Filtreler</span>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                onCategoryChange={handleCategoryChange}
                onPriceRangeChange={handlePriceRangeChange}
                onReset={handleReset}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredProducts.length}</span> ürün bulundu
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-700">Sırala:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="popular">Popüler</option>
                  <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                  <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                  <option value="name-asc">İsim: A-Z</option>
                  <option value="name-desc">İsim: Z-A</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600 text-lg">Ürün bulunamadı.</p>
                <button
                  onClick={handleReset}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  Filtreleri temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

