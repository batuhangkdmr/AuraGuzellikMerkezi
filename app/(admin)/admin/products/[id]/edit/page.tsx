import { getCategoryTree } from '@/app/server-actions/categoryActions';
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

  // Load categories for selection (server-side)
  const result = await getCategoryTree(true); // Include inactive for admin
  const categories = result.success && result.data ? result.data : [];

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

        <EditProductFormWithCategories productId={productId} categories={categories} />
      </div>
    </div>
  );
}

