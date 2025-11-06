'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateService } from '../../actions';
import ImageUpload from '../../../blog/ImageUpload';
import type { Service } from '@/lib/models/Service';

interface EditServiceFormProps {
  service: Service;
}

export default function EditServiceForm({ service }: EditServiceFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(service.image || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('image', imageUrl);

    const result = await updateService(service.id, formData);

    if (result.success) {
      alert(result.message);
      router.push('/admin/hizmetler');
      router.refresh();
    } else {
      setError(result.error || 'Bir hata oluştu');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Başlık */}
      <div>
        <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
          Hizmet Başlığı *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          disabled={isSubmitting}
          defaultValue={service.title}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent text-gray-900"
          placeholder="Örn: Lüx Premium Cilt Bakımı"
        />
      </div>

      {/* Resim Yükleme */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Hizmet Resmi
        </label>
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          disabled={isSubmitting}
        />
      </div>

      {/* Kısa Açıklama (Excerpt) */}
      <div>
        <label htmlFor="excerpt" className="block text-gray-700 font-semibold mb-2">
          Kısa Açıklama
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={3}
          disabled={isSubmitting}
          defaultValue={service.excerpt || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent text-gray-900"
          placeholder="Liste sayfasında görünecek kısa açıklama (isteğe bağlı)"
        />
        <p className="text-sm text-gray-500 mt-1">
          Bu açıklama hizmetler listesi sayfasında görünecek
        </p>
      </div>

      {/* Detaylı İçerik */}
      <div>
        <label htmlFor="content" className="block text-gray-700 font-semibold mb-2">
          Detaylı Açıklama *
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          disabled={isSubmitting}
          defaultValue={service.content}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent text-gray-900"
          placeholder="Hizmetin detaylı açıklaması (detay sayfasında görünecek)"
        />
        <p className="text-sm text-gray-500 mt-1">
          Bu içerik hizmet detay sayfasında görünecek
        </p>
      </div>

      {/* Yayın Durumu */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="published"
          name="published"
          disabled={isSubmitting}
          defaultChecked={service.published}
          className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
        />
        <label htmlFor="published" className="ml-2 text-gray-700">
          Hizmeti yayında tut
        </label>
      </div>

      {/* Butonlar */}
      <div className="flex space-x-4 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          İptal
        </button>
      </div>
    </form>
  );
}

