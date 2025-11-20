'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserProfile } from '@/app/auth/actions';
import Link from 'next/link';

interface SettingsFormProps {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);

    const result = await updateUserProfile(formData);

    if (result.success) {
      setSuccess('Bilgileriniz başarıyla güncellendi');
      router.refresh();
    } else {
      setError(result.error || 'Güncelleme başarısız');
    }

    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Şifre Değiştirme Bölümü */}
        <div className="border-t-2 border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Şifre Değiştir</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Mevcut Şifre
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Mevcut şifrenizi girin"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Yeni şifrenizi girin (min 8 karakter)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir
              </p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre Tekrar
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Yeni şifrenizi tekrar girin"
              />
            </div>
          </div>
        </div>

        {/* Ad Soyad */}
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Ad Soyad
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            minLength={2}
            defaultValue={user.name}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 text-gray-900"
          />
        </div>

        {/* E-posta */}
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            defaultValue={user.email}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 text-gray-900"
          />
        </div>

        {/* Şifre Değiştirme (Opsiyonel) */}
        <div>
          <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
            Mevcut Şifre (Şifre değiştirmek için)
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 text-gray-900"
            placeholder="Şifre değiştirmek istemiyorsanız boş bırakın"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
            Yeni Şifre
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            disabled={loading}
            minLength={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 text-gray-900"
            placeholder="En az 8 karakter"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Şifre en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir.
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Yeni Şifre Tekrar
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            disabled={loading}
            minLength={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100 text-gray-900"
            placeholder="Yeni şifrenizi tekrar girin"
          />
        </div>

        {/* Butonlar */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
          </button>
          <Link
            href="/profile"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}

