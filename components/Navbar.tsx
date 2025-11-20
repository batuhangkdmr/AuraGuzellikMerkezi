import Link from 'next/link';
import { getCurrentUser } from '@/app/auth/actions';
import { getCategoryTree } from '@/app/server-actions/categoryActions';
import UserMenu from './UserMenu';
import MegaMenuServer from './MegaMenuServer';
import SearchBar from './SearchBar';
import NavbarClient from './NavbarClient';
import AllCategoriesMenuServer from './AllCategoriesMenuServer';
import NavbarMobile from './NavbarMobile';
import LoginRegisterButtons from './LoginRegisterButtons';

export default async function Navbar() {
  const user = await getCurrentUser();
  const categoriesResult = await getCategoryTree(false);
  const categories = categoriesResult.success && categoriesResult.data ? categoriesResult.data : [];

  return (
    <>
      {/* Utility Bar - Top Links (Desktop Only) - White Text */}
      <div className="hidden lg:block bg-primary-blue-dark border-b-2 border-accent-yellow shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-end items-center h-10 text-sm">
            <div className="flex items-center space-x-6">
              <Link href="/hakkimizda" className="text-white hover:text-accent-yellow transition font-semibold hover:underline decoration-accent-yellow">
                Hakkımızda
              </Link>
              <Link href="/iletisim" className="text-white hover:text-accent-yellow transition font-semibold hover:underline decoration-accent-yellow">
                Yardım & Destek
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar - Modern Design with Yellow Accents */}
      <nav className="bg-primary-blue shadow-2xl sticky top-0 z-50 border-b-4 border-accent-yellow">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Mobile Layout */}
          <div className="lg:hidden flex items-center justify-between h-16">
            {/* Mobile Menu Button & Logo */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <NavbarMobile categories={categories} />
              <Link href="/" className="text-xl font-extrabold text-white drop-shadow-lg hover:text-accent-yellow transition">
                New Holland
              </Link>
            </div>

            {/* Mobile Search Icon */}
            <Link
              href="/products"
              className="p-2.5 text-white hover:text-accent-yellow hover:bg-primary-blue-dark rounded-lg transition-all"
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
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {user ? (
                <NavbarClient user={user} />
              ) : (
                <LoginRegisterButtons variant="mobile" />
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* Logo - White Text */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0 group">
              <div className="bg-accent-yellow/20 rounded-lg p-2 group-hover:bg-accent-yellow/30 transition">
                <span className="text-3xl font-extrabold text-white drop-shadow-lg group-hover:text-accent-yellow transition">
                  NH
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-white drop-shadow-lg leading-tight group-hover:text-accent-yellow transition">
                  New Holland
                </div>
                <div className="text-xs text-white/90 font-semibold">
                  Yedek Parça Bayi
                </div>
              </div>
            </Link>

            {/* Search Bar - Enhanced */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar />
            </div>

            {/* User Actions - Enhanced */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                <NavbarClient user={user} />
              ) : (
                <LoginRegisterButtons variant="desktop" />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Category Menu Bar (Desktop Only) - Enhanced Design */}
      <div className="hidden lg:block bg-primary-blue-dark border-t-4 border-accent-yellow sticky top-[80px] z-40 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
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
