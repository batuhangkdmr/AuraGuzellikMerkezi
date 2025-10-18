'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../actions';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);

    if (result.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(result.error || 'Kayıt başarısız!');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Hata Mesajı */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Kullanıcı Adı */}
      <div className="mb-4">
        <label htmlFor="username" className="block text-gray-700 font-semibold mb-2">
          Kullanıcı Adı
        </label>
        <input
          type="text"
          id="username"
          name="username"
          required
          minLength={3}
          maxLength={20}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          placeholder="3-20 karakter arası"
        />
      </div>

      {/* Şifre */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
          Şifre
        </label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minLength={6}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          placeholder="En az 6 karakter"
        />
      </div>

      {/* Şifre Tekrarı */}
      <div className="mb-4">
        <label htmlFor="passwordConfirm" className="block text-gray-700 font-semibold mb-2">
          Şifre Tekrarı
        </label>
        <input
          type="password"
          id="passwordConfirm"
          name="passwordConfirm"
          required
          minLength={6}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          placeholder="Şifrenizi tekrar girin"
        />
      </div>

      {/* Kayıt Anahtarı */}
      <div className="mb-6">
        <label htmlFor="secretKey" className="block text-gray-700 font-semibold mb-2">
          Kayıt Anahtarı 🔑
        </label>
        <input
          type="password"
          id="secretKey"
          name="secretKey"
          required
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
          placeholder="Kayıt anahtarını girin"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Kayıt anahtarını yöneticinizden alın
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
      </button>
    </form>
  );
}

