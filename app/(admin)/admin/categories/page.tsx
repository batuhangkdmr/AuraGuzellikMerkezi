import { getCategoryTree } from '@/app/server-actions/categoryActions';
import { CategoryRepository } from '@/lib/repositories/CategoryRepository';
import Link from 'next/link';
import Image from 'next/image';
import DeleteCategoryButton from './DeleteCategoryButton';
import ToggleCategoryActiveButton from './ToggleCategoryActiveButton';

// Helper function to get parent path
function getCategoryPath(category: any, allCategories: any[], path: string[] = []): string[] {
  if (!category.parentId) {
    return [category.name];
  }
  
  const parent = allCategories.find((c: any) => c.id === category.parentId);
  if (!parent) {
    return [category.name];
  }
  
  // Find parent in tree structure
  function findCategoryInTree(tree: any[], id: number): any | null {
    for (const cat of tree) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryInTree(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  }
  
  // This is a simplified version - we'll pass the tree structure
  return [...path, category.name];
}

// Helper function to render category tree with better hierarchy visualization
function renderCategoryRow(category: any, level: number = 0, parentName: string | null = null): React.ReactNode {
  const indent = level * 32; // 32px per level for better visibility
  const hasChildren = category.children && category.children.length > 0;
  
  // Level indicators
  const levelColors = [
    'border-l-4 border-blue-500', // Level 0 (Main category)
    'border-l-4 border-green-500', // Level 1 (Subcategory)
    'border-l-4 border-purple-500', // Level 2 (Child category)
  ];
  const levelColor = levelColors[level] || 'border-l-4 border-gray-400';
  
  const levelLabels = ['Ana Kategori', 'Alt Kategori', 'Alt Alt Kategori'];
  const levelLabel = levelLabels[level] || `Seviye ${level + 1}`;

  return (
    <>
      <tr key={category.id} className={`hover:bg-gray-50 ${levelColor} ${!category.isActive ? 'opacity-60' : ''}`}>
        <td className="px-6 py-4" style={{ paddingLeft: `${16 + indent}px` }}>
          <div className="flex items-center space-x-3">
            {/* Level indicator */}
            <div className="flex flex-col items-center min-w-[60px]">
              {level === 0 && <span className="text-2xl">📁</span>}
              {level === 1 && <span className="text-xl">📂</span>}
              {level === 2 && <span className="text-lg">📄</span>}
              <span className="text-xs text-gray-500 mt-1">{levelLabel}</span>
            </div>
            
            {/* Category name and parent info */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={`font-medium ${level === 0 ? 'text-lg text-gray-900' : level === 1 ? 'text-base text-gray-800' : 'text-sm text-gray-700'}`}>
                  {category.name}
                </span>
                {hasChildren && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {category.children.length} alt kategori
                  </span>
                )}
              </div>
              {parentName && (
                <div className="text-xs text-gray-500 mt-1">
                  <span className="text-gray-400">←</span> Üst kategori: <span className="font-medium">{parentName}</span>
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
        </td>
        <td className="px-6 py-4">
          {category.image ? (
            <div className="relative h-16 w-16 border-2 border-gray-200 rounded-lg overflow-hidden">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ) : (
            <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-xs text-gray-400">Görsel yok</span>
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm font-medium text-gray-600">{category.displayOrder}</span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <ToggleCategoryActiveButton
            categoryId={category.id}
            isActive={category.isActive}
            categoryName={category.name}
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="text-pink-600 hover:text-pink-900 font-medium"
          >
            Düzenle
          </Link>
          <span className="text-gray-300">|</span>
          <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
        </td>
      </tr>
      {hasChildren &&
        category.children.map((child: any) => renderCategoryRow(child, level + 1, category.name))}
    </>
  );
}

export default async function AdminCategoriesPage() {
  try {
    // Get category tree (hierarchical structure)
    const result = await getCategoryTree(true); // Include inactive for admin
    const categories = result.success && result.data ? result.data : [];

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
            <Link
              href="/admin/categories/new"
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Yeni Kategori Ekle
            </Link>
          </div>

          {categories.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">Henüz kategori bulunmamaktadır.</p>
              <Link
                href="/admin/categories/new"
                className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                İlk Kategoriyi Ekle
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                        Kategori Hiyerarşisi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                        Görsel
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                        Sıra
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                        Durum
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => renderCategoryRow(category, 0, null))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
            <Link
              href="/admin/categories/new"
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Yeni Kategori Ekle
            </Link>
          </div>
          <p className="text-red-600">Kategoriler yüklenirken bir hata oluştu</p>
        </div>
      </div>
    );
  }
}

