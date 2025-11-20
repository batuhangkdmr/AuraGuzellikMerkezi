'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      href: '/admin/orders',
      label: 'Siparişler',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.593m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
    },
    {
      href: '/admin/products',
      label: 'Ürünler',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
    },
    {
      href: '/admin/categories',
      label: 'Kategoriler',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      ),
    },
    {
      href: '/admin/attributes',
      label: 'Ürün Özellikleri',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-7.5a2.25 2.25 0 012.25-2.25h.75m-6-3.75l3 3m0 0l3-3m-3 3V7.5m6 9h.75a2.25 2.25 0 002.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-7.5a2.25 2.25 0 012.25-2.25h.75" />
        </svg>
      ),
    },
    {
      href: '/admin/users',
      label: 'Kullanıcılar',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-2.513m0 0a9.268 9.268 0 01-2.625-.372A9.268 9.268 0 0115 19.128m-4.5-1.128a9.268 9.268 0 01-2.625-.372 9.337 9.337 0 01-4.121-2.513m0 0a9.268 9.268 0 00-2.625.372 9.268 9.268 0 002.625.372m0 0a9.337 9.337 0 01-4.121 2.513m4.121-2.513a9.268 9.268 0 01-2.625-.372M15 19.128v-3.128m0 0a9.268 9.268 0 00-2.625-.372M15 16v-3.128m-4.5 3.128v-3.128m0 0a9.268 9.268 0 00-2.625-.372M10.5 16v-3.128m4.5 3.128v-3.128m0 0a9.337 9.337 0 01-4.121-2.513M15 12.872v-3.128m-4.5 3.128v-3.128m0 0a9.268 9.268 0 00-2.625-.372M10.5 9.744v-3.128m4.5 3.128v-3.128m0 0a9.337 9.337 0 01-4.121-2.513M15 6.616v-3.128m-4.5 3.128v-3.128m0 0a9.268 9.268 0 00-2.625-.372M10.5 3.488V.36m0 0a9.268 9.268 0 00-2.625.372M10.5 3.488v3.128m0 0a9.337 9.337 0 01-4.121 2.513M10.5 6.616v3.128m-4.5-3.128v3.128m0 0a9.268 9.268 0 00-2.625.372m4.5-3.128a9.337 9.337 0 01-4.121-2.513m0 0a9.268 9.268 0 00-2.625.372m0 0a9.337 9.337 0 014.121 2.513M3.375 6.616v3.128m0 0v3.128m0-3.128a9.268 9.268 0 00-2.625.372m2.625 2.756v-3.128m0 0v-3.128m0 3.128a9.337 9.337 0 01-4.121 2.513m4.121-2.513v3.128m0 0v3.128m0-3.128a9.268 9.268 0 002.625.372m-2.625-2.756v3.128m0 0v3.128m0-3.128a9.337 9.337 0 014.121 2.513" />
        </svg>
      ),
    },
    {
      href: '/admin/reports',
      label: 'Raporlar',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      href: '/admin/randevular',
      label: 'Randevular',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white min-h-[calc(100vh-64px)] border-r border-gray-200">
      {/* Sidebar Header */}
      <div className="bg-primary-blue border-b-2 border-accent-yellow px-4 py-4">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2.25 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="text-white font-extrabold text-lg">New Holland Admin</span>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-3">
          {/* Dashboard */}
          <Link
            href="/admin"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {navItems[0].icon}
            </div>
            <span className="font-medium text-sm">{navItems[0].label}</span>
          </Link>

          {/* Divider */}
          <div className="my-2 border-t border-gray-200"></div>

          {/* Orders */}
          <Link
            href="/admin/orders"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/orders')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/orders') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {navItems[1].icon}
            </div>
            <span className="font-medium text-sm">{navItems[1].label}</span>
          </Link>

          {/* Products */}
          <Link
            href="/admin/products"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/products')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/products') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {navItems[2].icon}
            </div>
            <span className="font-medium text-sm">{navItems[2].label}</span>
          </Link>

          {/* Categories */}
          <Link
            href="/admin/categories"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/categories')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/categories') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {navItems[3].icon}
            </div>
            <span className="font-medium text-sm">{navItems[3].label}</span>
          </Link>

          {/* Attributes */}
          <Link
            href="/admin/attributes"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/attributes')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/attributes') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {navItems[4].icon}
            </div>
            <span className="font-medium text-sm">{navItems[4].label}</span>
          </Link>

          {/* Coupons */}
          <Link
            href="/admin/coupons"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/coupons')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/coupons') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-medium text-sm">Kuponlar</span>
          </Link>

          {/* Returns */}
          <Link
            href="/admin/returns"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/returns')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/returns') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-medium text-sm">İade/İptal</span>
          </Link>

          {/* Reviews */}
          <Link
            href="/admin/reviews"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/reviews')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/reviews') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="font-medium text-sm">Yorumlar</span>
          </Link>

          {/* Divider */}
          <div className="my-2 border-t border-gray-200"></div>

          {/* Users */}
          <Link
            href="/admin/users"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/users')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/users') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {navItems[5].icon}
            </div>
            <span className="font-medium text-sm">{navItems[5].label}</span>
          </Link>

          {/* Reports */}
          <Link
            href="/admin/reports"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/reports')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/reports') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {navItems[6].icon}
            </div>
            <span className="font-medium text-sm">{navItems[6].label}</span>
          </Link>

          {/* Appointments */}
          <Link
            href="/admin/randevular"
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
              isActive('/admin/randevular')
                ? 'bg-primary-blue/10 text-primary-blue border-l-4 border-primary-blue'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 ${isActive('/admin/randevular') ? 'text-primary-blue' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {navItems[7].icon}
            </div>
            <span className="font-medium text-sm">{navItems[7].label}</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}

