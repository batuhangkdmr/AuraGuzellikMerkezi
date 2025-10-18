// Register Page
import RegisterForm from './RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
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
        <RegisterForm />

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
