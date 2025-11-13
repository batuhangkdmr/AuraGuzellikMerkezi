'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCategory } from '@/app/server-actions/categoryActions';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils/slug';
import ImageUpload from '@/components/ImageUpload';
import { Category } from '@/lib/repositories/CategoryRepository';

interface CategoryFormProps {
  categories: Category[];
}

export default function CategoryForm({ categories }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);

  // Flatten category tree for dropdown
  const flattenCategories = (cats: Category[], level: number = 0): Array<Category & { level: number; displayName: string }> => {
    let result: Array<Category & { level: number; displayName: string }> = [];
    cats.forEach((cat) => {
      result.push({ ...cat, level, displayName: '  '.repeat(level) + cat.name });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Set image (single image for category)
      if (image) {
        formData.set('image', image);
      }

      // Set parentId
      if (parentId) {
        formData.set('parentId', parentId.toString());
      }

      const result = await createCategory(formData);

      if (result.success && result.data) {
        router.push('/admin/categories');
      } else {
        setError(result.error || 'Kategori oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const flatCategories = flattenCategories(categories);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
          Kategori Adı *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          onChange={(e) => {
            // Auto-generate slug if user hasn't manually edited it
            if (!isSlugManual) {
              const autoSlug = generateSlug(e.target.value);
              setSlug(autoSlug);
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-gray-700 font-medium mb-2">
          Slug (URL) *
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setIsSlugManual(true);
          }}
          pattern="[a-z0-9-]+"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Sadece küçük harf, rakam ve tire kullanılabilir
        </p>
      </div>

      <div>
        <label htmlFor="parentId" className="block text-gray-700 font-medium mb-2">
          Üst Kategori (Opsiyonel)
        </label>
        <select
          id="parentId"
          name="parentId"
          value={parentId || ''}
          onChange={(e) => setParentId(e.target.value ? parseInt(e.target.value, 10) : null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Ana Kategori (Üst kategori yok)</option>
          {flatCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.displayName}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Bu kategoriyi bir üst kategorinin alt kategorisi yapmak için seçin
        </p>
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Kategori Görseli (Opsiyonel)
        </label>
        <ImageUpload
          images={image ? [image] : []}
          onImagesChange={(images) => {
            setImage(images.length > 0 ? images[0] : null);
          }}
          maxImages={1}
          folder="categories"
        />
        <p className="text-xs text-gray-500 mt-1">
          Kategori görseli yüklemek zorunlu değildir
        </p>
      </div>

      <div>
        <label htmlFor="displayOrder" className="block text-gray-700 font-medium mb-2">
          Sıra Numarası
        </label>
        <input
          type="number"
          id="displayOrder"
          name="displayOrder"
          min="0"
          defaultValue="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Menülerde görüntülenme sırası (küçük sayılar önce görünür)
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          defaultChecked
          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Aktif (Kategori sitede görünsün)
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-pink-600 hover:bg-pink-700 text-white'
          }`}
        >
          {isSubmitting ? 'Oluşturuluyor...' : 'Kategori Oluştur'}
        </button>
        <Link
          href="/admin/categories"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}

