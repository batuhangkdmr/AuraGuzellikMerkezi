'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/app/server-actions/productActions';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { generateSlug } from '@/lib/utils/slug';
import CategorySelector from '@/components/CategorySelector';
import { Category } from '@/lib/repositories/CategoryRepository';

interface ProductFormProps {
  categories: Category[];
}

export default function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate categories
      if (selectedCategoryIds.length === 0) {
        setError('Lütfen en az bir kategori seçin');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData(e.currentTarget);
      
      // Set images
      formData.set('images', JSON.stringify(images || []));
      
      // Set category IDs
      formData.set('categoryIds', JSON.stringify(selectedCategoryIds));
      
      // Set primary category ID
      if (primaryCategoryId) {
        formData.set('primaryCategoryId', primaryCategoryId.toString());
      }

      const result = await createProduct(formData);

      if (result.success && result.data) {
        router.push('/admin/products');
      } else {
        setError(result.error || 'Ürün oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ürün oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
          Ürün Adı *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          onChange={(e) => {
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
        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
          Açıklama *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="block text-gray-700 font-medium mb-2">
            Fiyat (₺) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-gray-700 font-medium mb-2">
            Stok *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            required
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Category Selector */}
      <CategorySelector
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryChange={setSelectedCategoryIds}
        primaryCategoryId={primaryCategoryId}
        onPrimaryCategoryChange={setPrimaryCategoryId}
      />

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Ürün Görselleri *
        </label>
        <ImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={10}
          folder="products"
        />
        <p className="text-xs text-gray-500 mt-1">
          İlk görsel ürünün ana görseli olarak kullanılacaktır. Maksimum 10 görsel yükleyebilirsiniz.
        </p>
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
          {isSubmitting ? 'Oluşturuluyor...' : 'Ürün Oluştur'}
        </button>
        <Link
          href="/admin/products"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          İptal
        </Link>
      </div>
    </form>
  );
}

