import { getCategoryById, getCategoryTree } from '@/app/server-actions/categoryActions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EditCategoryForm from './EditCategoryForm';

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);
  
  if (isNaN(categoryId)) {
    notFound();
  }

  // Get category to edit
  const categoryResult = await getCategoryById(categoryId, true);
  if (!categoryResult.success || !categoryResult.data) {
    notFound();
  }

  const category = categoryResult.data;

  // Get all categories for parent selection (exclude current category and its children to prevent circular reference)
  const categoriesResult = await getCategoryTree(true);
  const allCategories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  // Filter out current category and its children
  const filterCategory = (cats: any[], excludeId: number): any[] => {
    return cats
      .filter((cat) => cat.id !== excludeId)
      .map((cat) => {
        if (cat.children && cat.children.length > 0) {
          return {
            ...cat,
            children: filterCategory(cat.children, excludeId),
          };
        }
        return cat;
      });
  };

  const availableCategories = filterCategory(allCategories, categoryId);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kategori Düzenle</h1>
          <Link
            href="/admin/categories"
            className="text-pink-600 hover:text-pink-700"
          >
            ← Geri Dön
          </Link>
        </div>

        <EditCategoryForm category={category} availableCategories={availableCategories} />
      </div>
    </div>
  );
}

