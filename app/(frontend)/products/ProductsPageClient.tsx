'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import AdvancedProductFilters from '@/components/AdvancedProductFilters';
import { Category } from '@/lib/repositories/CategoryRepository';
import { AttributeWithValues } from '@/lib/repositories/AttributeRepository';
import { getAllProducts } from '@/app/server-actions/productActions';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  description?: string;
  brand?: string;
}

interface ProductsPageClientProps {
  products: Product[];
  categories: Category[];
  attributes: AttributeWithValues[];
  brands: Array<{ brand: string; count: number }>;
  initialCategory?: string;
  initialFilters?: Record<string, string | undefined>;
}

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function ProductsPageClient({
  products: initialProducts,
  categories,
  attributes,
  brands,
  initialCategory,
  initialFilters = {},
}: ProductsPageClientProps) {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Keep products in client-side state to avoid full page re-render
  const [products, setProducts] = useState(initialProducts);

  // Parse initial filters from URL
  const parseInitialFilters = () => {
    const parsedCategories: string[] = [];
    const parsedBrands: string[] = [];
    const parsedAttributes: Record<string, string[]> = {};
    let priceRange = { min: 0, max: 0 };

    // Parse categories
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      parsedCategories.push(categoryParam);
    }

    // Parse brands
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      parsedBrands.push(...brandParam.split(','));
    }

    // Parse price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice) priceRange.min = parseFloat(minPrice);
    if (maxPrice) priceRange.max = parseFloat(maxPrice);

    // Parse attributes (format: attr_slug=value1,value2)
    attributes.forEach((attr) => {
      const param = searchParams.get(attr.slug);
      if (param) {
        // Decode URL-encoded values
        parsedAttributes[attr.slug] = param.split(',').map(v => decodeURIComponent(v));
      }
    });

    return { categories: parsedCategories, brands: parsedBrands, priceRange, attributes: parsedAttributes };
  };

  const initial = parseInitialFilters();
  const [selectedFilters, setSelectedFilters] = useState({
    categories: initial.categories,
    brands: initial.brands,
    priceRange: initial.priceRange,
    attributes: initial.attributes,
  });
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Update products when initialProducts change (from server-side render)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Filter products based on all filters
  // Note: Category and attribute filtering is done server-side
  // We only do client-side filtering for brand and price (which are simpler)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by brand (client-side, simple filter)
    if (selectedFilters.brands.length > 0) {
      filtered = filtered.filter((product) =>
        product.brand && selectedFilters.brands.includes(product.brand)
      );
    }

    // Filter by price range (client-side, simple filter)
    if (selectedFilters.priceRange.min > 0 || selectedFilters.priceRange.max > 0) {
      filtered = filtered.filter((product) => {
        if (selectedFilters.priceRange.min > 0 && product.price < selectedFilters.priceRange.min) return false;
        if (selectedFilters.priceRange.max > 0 && product.price > selectedFilters.priceRange.max) return false;
        return true;
      });
    }

    // Category and attribute filtering is done server-side via getAllProducts
    // Products are already filtered when they arrive here

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
  }, [products, selectedFilters, sortBy]);

  // Update URL and fetch products when filters change
  const updateURL = (filters: typeof selectedFilters) => {
    const params = new URLSearchParams();

    // Add category
    if (filters.categories.length > 0) {
      params.set('category', filters.categories[0]); // For now, only one category
    }

    // Add brands
    if (filters.brands.length > 0) {
      params.set('brand', filters.brands.join(','));
    }

    // Add price range
    if (filters.priceRange.min > 0) {
      params.set('minPrice', filters.priceRange.min.toString());
    }
    if (filters.priceRange.max > 0) {
      params.set('maxPrice', filters.priceRange.max.toString());
    }

    // Add attributes (attribute slug -> value slugs)
    // URL encode the values to handle special characters
    Object.entries(filters.attributes).forEach(([attrSlug, values]) => {
      if (values.length > 0) {
        // Join values with comma and encode if needed
        const encodedValues = values.map(v => encodeURIComponent(v)).join(',');
        params.set(attrSlug, encodedValues);
      }
    });

    // Build URL - ensure it's a valid path
    const queryString = params.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    
    // Update state first
    setSelectedFilters(filters);
    
    // Update URL using window.history.replaceState to avoid page refresh
    // This updates the URL without triggering a server-side render
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', newUrl);
    }
    
    // Fetch filtered products in the background using startTransition
    // This prevents blocking the UI and only updates the products list
    startTransition(async () => {
      const category = filters.categories.length > 0 ? filters.categories[0] : undefined;
      const attributeFilters: Record<string, string[]> = {};
      
      // Convert attribute slugs to the format expected by getAllProducts
      Object.entries(filters.attributes).forEach(([attrSlug, values]) => {
        if (values.length > 0) {
          attributeFilters[attrSlug] = values;
        }
      });
      
      const result = await getAllProducts(category, undefined, attributeFilters);
      if (result.success && result.data) {
        setProducts(result.data);
      }
    });
  };

  const handleFilterChange = (filters: typeof selectedFilters) => {
    updateURL(filters);
  };

  const handleReset = () => {
    const emptyFilters = {
      categories: [],
      brands: [],
      priceRange: { min: 0, max: 0 },
      attributes: {},
    };
    setSelectedFilters(emptyFilters);
    
    // Update URL using window.history.replaceState to avoid page refresh
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', '/products');
    }
    
    // Fetch all products
    startTransition(async () => {
      const result = await getAllProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-900">Filtreler</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Filtreleri Kapat"
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
            <div className="p-4">
              <AdvancedProductFilters
                categories={categories}
                attributes={attributes}
                brands={brands}
                selectedFilters={selectedFilters}
                onFilterChange={(filters) => {
                  handleFilterChange(filters);
                  setShowMobileFilters(false);
                }}
                onReset={() => {
                  handleReset();
                  setShowMobileFilters(false);
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Header Section - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-16 z-30">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Mobile Header */}
          <div className="lg:hidden py-3">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold text-gray-900">
                {filteredProducts.length} Ürün
              </h1>
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span>Filtrele</span>
              </button>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900 bg-white"
            >
              <option value="popular">Popüler</option>
              <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
              <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
              <option value="name-asc">İsim: A-Z</option>
              <option value="name-desc">İsim: Z-A</option>
            </select>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between py-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{filteredProducts.length}</span> ürün bulundu
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-700">Sırala:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
              >
                <option value="popular">Popüler</option>
                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="name-asc">İsim: A-Z</option>
                <option value="name-desc">İsim: Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <AdvancedProductFilters
              categories={categories}
              attributes={attributes}
              brands={brands}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Loading State */}
            {isPending ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  <span className="ml-3 text-gray-600">Filtreleniyor...</span>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-gray-600 text-lg mb-2">Ürün bulunamadı</p>
                <p className="text-gray-500 text-sm mb-4">Filtrelerinizi değiştirerek tekrar deneyin</p>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
