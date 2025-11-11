import Link from 'next/link';
import { getCurrentUser } from '@/app/auth/actions';
import UserMenu from './UserMenu';

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-pink-600">
            Aura Güzellik
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-pink-600 transition">
              Ana Sayfa
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-pink-600 transition">
              Ürünler
            </Link>
            <Link href="/hakkimizda" className="text-gray-700 hover:text-pink-600 transition">
              Hakkımızda
            </Link>
            <Link href="/randevu" className="text-gray-700 hover:text-pink-600 transition">
              Randevu
            </Link>
            <Link href="/iletisim" className="text-gray-700 hover:text-pink-600 transition">
              İletişim
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-700 hover:text-pink-600 transition"
                  title="Sepetim"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </Link>
                <UserMenu userName={user.name} userRole={user.role} />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-pink-600 transition font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

