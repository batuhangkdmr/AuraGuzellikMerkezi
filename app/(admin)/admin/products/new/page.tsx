'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/app/server-actions/productActions';
import Link from 'next/link';
import ImageUpload from '@/components/ImageUpload';
import { generateSlug } from '@/lib/utils/slug';

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Debug: Log images before sending
      console.log('Images state before submit:', images);
      console.log('Images count:', images?.length || 0);
      
      const formData = new FormData(e.currentTarget);
      
      // Explicitly set images in formData (override hidden input if needed)
      // This ensures images are always included even if hidden input doesn't update
      formData.set('images', JSON.stringify(images || []));
      
      // Debug: Log formData images
      const formImages = formData.get('images');
      console.log('Images from formData after set:', formImages);
      
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
          <Link
            href="/admin/products"
            className="text-pink-600 hover:text-pink-700"
          >
            ← Geri Dön
          </Link>
        </div>

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
              pattern="[a-z0-9-]+"
              onChange={(e) => {
                setSlug(e.target.value);
                setIsSlugManual(true);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="urun-adi"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500">
                Sadece küçük harf, rakam ve tire kullanın
              </p>
              {isSlugManual && (
                <button
                  type="button"
                  onClick={() => {
                    const nameInput = document.getElementById('name') as HTMLInputElement;
                    if (nameInput) {
                      const autoSlug = generateSlug(nameInput.value);
                      setSlug(autoSlug);
                      setIsSlugManual(false);
                    }
                  }}
                  className="text-xs text-pink-600 hover:text-pink-700 underline"
                >
                  Otomatik oluştur
                </button>
              )}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              💡 Slug, ürün adından otomatik oluşturulur. İsterseniz manuel olarak düzenleyebilirsiniz.
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
              rows={5}
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

          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={10}
            folder="products"
          />

          {/* Hidden input for images to ensure they are included in form submission */}
          <input
            type="hidden"
            name="images"
            value={JSON.stringify(images)}
          />

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-pink-600 hover:bg-pink-700 text-white'
              }`}
            >
              {isSubmitting ? 'Oluşturuluyor...' : 'Ürünü Oluştur'}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              İptal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

