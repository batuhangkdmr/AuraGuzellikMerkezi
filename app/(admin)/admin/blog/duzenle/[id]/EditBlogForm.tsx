'use client';

import { useState } from 'react';
import { updateBlog } from '../../actions';
import { useRouter } from 'next/navigation';
import ImageUpload from '../../ImageUpload';

interface EditBlogFormProps {
  blog: {
    id: number;
    title: string;
    excerpt?: string;
    content: string;
    image?: string;
    published: boolean;
  };
}

export default function EditBlogForm({ blog }: EditBlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(blog.image || '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateBlog(blog.id, formData);
    
    if (result.success) {
      router.push('/admin/blog');
      router.refresh();
    } else {
      alert('Hata: ' + result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Başlık *
        </label>
        <input
          type="text"
          name="title"
          required
          defaultValue={blog.title}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          Özet (Opsiyonel)
        </label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={blog.excerpt || ''}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
        ></textarea>
      </div>
      
      <ImageUpload 
        value={imageUrl}
        onChange={setImageUrl}
      />
      
      <div>
        <label className="block text-gray-700 font-semibold mb-2">
          İçerik *
        </label>
        <textarea
          name="content"
          required
          rows={10}
          defaultValue={blog.content}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
        ></textarea>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          name="published"
          value="true"
          id="published"
          defaultChecked={blog.published}
          className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
        />
        <label htmlFor="published" className="ml-2 text-gray-700">
          Yayında
        </label>
      </div>
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition disabled:opacity-50"
        >
          {loading ? 'Güncelleniyor...' : 'Güncelle'}
        </button>
        <a
          href="/admin/blog"
          className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
        >
          İptal
        </a>
      </div>
    </form>
  );
}

