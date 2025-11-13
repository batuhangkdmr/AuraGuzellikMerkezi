import { getAllProducts } from '@/app/server-actions/productActions';
import { getCategoryTree } from '@/app/server-actions/categoryActions';
import ProductsPageClient from './ProductsPageClient';

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;

  // Get products and categories
  const [productsResult, categoriesResult] = await Promise.all([
    getAllProducts(category), // Filter by category if provided
    getCategoryTree(false), // Only active categories
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

  return (
    <ProductsPageClient
      products={products}
      categories={categories}
      initialCategory={category}
    />
  );
}

