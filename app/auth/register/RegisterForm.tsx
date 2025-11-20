'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '../actions';
import { UserRole } from '@/lib/types/UserRole';

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const password = formData.get('password') as string;
    const passwordConfirm = formData.get('passwordConfirm') as string;
    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor');
      setLoading(false);
      return;
    }

    formData.set('role', role);

    // If role is USER, remove secretKey from formData (if it exists)
    // This ensures secretKey is not sent when user selects USER role
    if (role === UserRole.USER) {
      formData.delete('secretKey');
    }

    const result = await registerUser(formData);

    if (result.success) {
      const nextPath = result.data?.role === UserRole.ADMIN ? '/admin' : '/profile';
      router.push(nextPath);
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

      {/* İsim */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
          Ad Soyad
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          minLength={2}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-gray-900"
          placeholder="Adınızı ve soyadınızı girin"
        />
      </div>

      {/* E-posta */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
          E-posta
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-gray-900"
          placeholder="ornek@domain.com"
        />
      </div>

      {/* Rol Seçimi */}
      <div className="mb-4">
        <label htmlFor="role" className="block text-gray-700 font-semibold mb-2">
          Rol
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-gray-900"
        >
          <option value={UserRole.USER}>Kullanıcı</option>
          <option value={UserRole.ADMIN}>Yönetici</option>
        </select>
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
          minLength={8}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-gray-900"
          placeholder="En az 8 karakter, büyük harf, küçük harf ve rakam içermeli"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Şifre en az 8 karakter olmalı, büyük harf, küçük harf ve rakam içermelidir.
        </p>
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
          minLength={8}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-gray-900"
          placeholder="Şifrenizi tekrar girin"
        />
      </div>

      {/* Kayıt Anahtarı (sadece admin için) */}
      {role === UserRole.ADMIN && (
        <div className="mb-6">
          <label htmlFor="secretKey" className="block text-gray-700 font-semibold mb-2">
            Yönetici Kayıt Anahtarı 🔑
          </label>
          <input
            type="password"
            id="secretKey"
            name="secretKey"
            required
            disabled={loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-gray-900"
            placeholder="Yönetici anahtarını girin"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Admin hesabı oluşturmak için yöneticiden aldığınız anahtarı girmeniz gerekir.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent-yellow text-primary-blue-dark font-bold py-3 rounded-lg hover:bg-accent-yellow-light transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
      </button>
    </form>
  );
}

