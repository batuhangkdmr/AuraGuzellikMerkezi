'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../actions';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(result.error || 'Giriş başarısız!');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Hata Mesajı */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
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
          placeholder="Kullanıcı adınızı girin"
        />
      </div>

      {/* Şifre */}
      <div className="mb-6">
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
          placeholder="Şifrenizi girin"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </button>
    </form>
  );
}

