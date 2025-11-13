import { getCategoryTree } from '@/app/server-actions/categoryActions';
import Link from 'next/link';
import CategoryForm from './CategoryForm';

export default async function NewCategoryPage() {
  // Load categories for parent selection (server-side)
  const result = await getCategoryTree(true); // Include inactive for admin
  const categories = result.success && result.data ? result.data : [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Kategori Ekle</h1>
          <Link
            href="/admin/categories"
            className="text-pink-600 hover:text-pink-700"
          >
            ← Geri Dön
          </Link>
        </div>

        <CategoryForm categories={categories} />
      </div>
    </div>
  );
}

