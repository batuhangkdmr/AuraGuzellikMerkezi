import { getCategoryTree } from '@/app/server-actions/categoryActions';
import { getAllAttributesWithValues } from '@/app/server-actions/attributeActions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EditProductFormWithCategories from './EditProductFormWithCategories';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  
  if (isNaN(productId)) {
    notFound();
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
          <Link
            href="/admin/products"
            className="text-pink-600 hover:text-pink-700"
          >
            ← Geri Dön
          </Link>
        </div>

        <EditProductFormWithCategories productId={productId} categories={categories} attributes={attributes} />
      </div>
    </div>
  );
}

