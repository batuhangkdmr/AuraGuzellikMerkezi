import { getAllProducts } from '@/app/server-actions/productActions';
import { getCategoryTree } from '@/app/server-actions/categoryActions';
import { getAllAttributesWithValues, getAllBrands } from '@/app/server-actions/attributeActions';
import ProductsPageClient from './ProductsPageClient';

interface ProductsPageProps {
  searchParams: Promise<{ 
    category?: string; 
    search?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    [key: string]: string | undefined;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const search = params.search;

  // First, get attributes to know which URL params are attribute filters
  const attributesResult = await getAllAttributesWithValues(false);
  const attributesForParsing = attributesResult.success && attributesResult.data ? attributesResult.data : [];
  
  // Parse attribute filters from URL
  const attributeFilters: Record<string, string[]> = {};
  attributesForParsing.forEach(attr => {
    const param = params[attr.slug];
    if (param) {
      // Decode URL-encoded values
      attributeFilters[attr.slug] = param.split(',').map(v => decodeURIComponent(v));
    }
  });

  // Get products, categories, attributes (with counts), and brands
  const [productsResult, categoriesResult, attributesResultWithCounts, brandsResult] = await Promise.all([
    getAllProducts(category, search, attributeFilters), // Filter by category, search, and attributes
    getCategoryTree(false), // Only active categories
    getAllAttributesWithValues(true), // Include product counts
    getAllBrands(true), // Include product counts
  ]);

  if (!productsResult.success || !productsResult.data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Ürünler</h1>
          <p className="text-red-600">{productsResult.error || 'Ürünler yüklenirken bir hata oluştu'}</p>
        </div>
      </div>
    );
  }

  const products = productsResult.data;
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];
  const attributes = attributesResultWithCounts.success && attributesResultWithCounts.data ? attributesResultWithCounts.data : [];
  const brands = brandsResult.success && brandsResult.data ? brandsResult.data : [];

  return (
    <ProductsPageClient
      products={products}
      categories={categories}
      attributes={attributes}
      brands={brands}
      initialCategory={category}
      initialFilters={params}
    />
  );
}

