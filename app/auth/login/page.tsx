// Login Page
import { Suspense } from 'react';
import LoginForm from './LoginForm';
import Link from 'next/link';

function LoginFormWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-blue to-primary-blue-dark px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo / Başlık */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            New Holland
          </h1>
          <p className="text-gray-600">Giriş Yap</p>
        </div>

        {/* Login Formu */}
        <LoginFormWrapper />

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="text-primary-blue hover:text-primary-blue-dark font-semibold">
              Kayıt Ol
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
