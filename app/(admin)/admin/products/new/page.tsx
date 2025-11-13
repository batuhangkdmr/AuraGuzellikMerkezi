import { getCategoryTree } from '@/app/server-actions/categoryActions';
import { getAllAttributesWithValues } from '@/app/server-actions/attributeActions';
import Link from 'next/link';
import ProductForm from './ProductForm';

export default async function NewProductPage() {
  // Load categories and attributes for selection (server-side)
  const [categoriesResult, attributesResult] = await Promise.all([
    getCategoryTree(true), // Include inactive for admin
    getAllAttributesWithValues(false), // Only active attributes
  ]);
  
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];
  const attributes = attributesResult.success && attributesResult.data ? attributesResult.data : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <Link
            href="/admin/products"
            className="text-pink-600 hover:text-pink-700"
          >
            ← Geri Dön
          </Link>
        </div>

        <ProductForm categories={categories} attributes={attributes} />
      </div>
    </div>
  );
}
