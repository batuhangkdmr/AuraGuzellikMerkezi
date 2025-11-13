import Link from 'next/link';
import { getCurrentUser } from '@/app/auth/actions';
import { getCategoryTree } from '@/app/server-actions/categoryActions';
import UserMenu from './UserMenu';
import MegaMenuServer from './MegaMenuServer';
import SearchBar from './SearchBar';
import NavbarClient from './NavbarClient';
import AllCategoriesMenuServer from './AllCategoriesMenuServer';
import NavbarMobile from './NavbarMobile';

export default async function Navbar() {
  const user = await getCurrentUser();
  const categoriesResult = await getCategoryTree(false);
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  return (
    <>
      {/* Utility Bar - Top Links (Desktop Only) */}
      <div className="hidden lg:block bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center h-8 text-xs text-gray-600">
            <div className="flex items-center space-x-4">
              <Link href="/hakkimizda" className="hover:text-pink-600 transition">
                Hakkımızda
              </Link>
              <Link href="/iletisim" className="hover:text-pink-600 transition">
                Yardım & Destek
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Mobile Layout */}
          <div className="lg:hidden flex items-center justify-between h-14">
            {/* Mobile Menu Button & Logo */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <NavbarMobile categories={categories} />
              <Link href="/" className="text-xl font-bold text-pink-600">
                Aura Güzellik
              </Link>
            </div>

            {/* Mobile Search Icon */}
            <Link
              href="/products"
              className="p-2 text-gray-700 hover:text-pink-600 transition-colors"
              aria-label="Ara"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {user ? (
                <NavbarClient user={user} />
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-700 hover:text-pink-600 transition font-medium"
                >
                  Giriş
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-pink-600 flex-shrink-0">
              Aura Güzellik
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-6">
              <SearchBar />
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {user ? (
                <NavbarClient user={user} />
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-pink-600 transition font-medium text-sm"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition text-sm"
                  >
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Category Menu Bar (Desktop Only) */}
      <div className="hidden lg:block bg-white border-t border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            {/* TÜM KATEGORİLER Button with Mega Menu */}
            <AllCategoriesMenuServer />

            {/* Main Categories */}
            <div className="flex-1 overflow-x-auto">
              <MegaMenuServer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
