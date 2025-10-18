// Register Page
import { redirect } from 'next/navigation';
import { register } from '../actions';
import Link from 'next/link';

export default function RegisterPage() {
  async function handleRegister(formData: FormData) {
    'use server';
    
    const result = await register(formData);
    
    if (result.success) {
      redirect('/admin');
    }
    
    return result;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo / Başlık */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Aura Güzellik
          </h1>
          <p className="text-gray-600">Admin Hesabı Oluştur</p>
        </div>

        {/* Register Formu */}
        <form action={handleRegister}>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Kayıt anahtarını girin"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Kayıt anahtarını yöneticinizden alın
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-300 shadow-lg"
          >
            Kayıt Ol
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
              Giriş Yap
            </Link>
          </p>
        </div>

        {/* Ana Sayfa Link */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

