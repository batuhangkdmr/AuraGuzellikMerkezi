'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAttribute } from '@/app/server-actions/attributeActions';
import Link from 'next/link';
import { generateSlug } from '@/lib/utils/slug';

export default function AttributeForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createAttribute(formData);

      if (result.success && result.data) {
        router.push('/admin/attributes');
      } else {
        setError(result.error || 'Özellik oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Özellik oluşturulurken bir hata oluştu');
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
          Özellik Adı * (Örn: Beden, Renk, Materyal)
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
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
          placeholder="Örn: Beden"
        />
        <p className="mt-1 text-sm text-gray-500">
          Bu isim filtreleme sayfasında başlık olarak görünecektir.
        </p>
      </div>

      <div>
        <label htmlFor="slug" className="block text-gray-700 font-medium mb-2">
          Slug (URL) *
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={slug}
          required
          onChange={(e) => {
            setSlug(e.target.value);
            setIsSlugManual(true);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
          placeholder="beden"
          pattern="^[a-z0-9-]+$"
        />
        <p className="mt-1 text-sm text-gray-500">
          Sadece küçük harf, rakam ve tire kullanın. Otomatik oluşturulur, manuel olarak da düzenleyebilirsiniz.
        </p>
      </div>

      <div>
        <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
          Özellik Tipi *
        </label>
        <select
          id="type"
          name="type"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
        >
          <option value="text">Metin (Text) - Checkbox listesi</option>
          <option value="color">Renk (Color) - Renk swatch'ları</option>
          <option value="number">Sayı (Number) - Sayısal değerler</option>
          <option value="boolean">Boolean - Evet/Hayır</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Renk tipi seçildiğinde, değerlere renk kodu (#FFFFFF) eklenebilir.
        </p>
      </div>

      <div>
        <label htmlFor="displayOrder" className="block text-gray-700 font-medium mb-2">
          Görüntüleme Sırası
        </label>
        <input
          type="number"
          id="displayOrder"
          name="displayOrder"
          min="0"
          defaultValue="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
        />
        <p className="mt-1 text-sm text-gray-500">
          Filtreleme sayfasında görüntülenme sırası. Düşük sayılar önce görünür.
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked
            className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded"
          />
          <span className="text-gray-700">Aktif</span>
        </label>
        <p className="mt-1 text-sm text-gray-500">
          Pasif özellikler filtreleme sayfasında görünmez.
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <Link
          href="/admin/attributes"
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          İptal
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Oluşturuluyor...' : 'Özellik Oluştur'}
        </button>
      </div>
    </form>
  );
}

