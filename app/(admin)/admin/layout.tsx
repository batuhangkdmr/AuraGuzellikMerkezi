import Link from 'next/link';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/auth';
import { UserRepository } from '@/lib/repositories/UserRepository';
import LogoutButton from './LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware zaten admin kontrolü yapıyor, burada sadece user bilgisini al
  // requireUser kullanmıyoruz çünkü redirect exception fırlatıyor
  const token = await getAuthCookie();
  let user = null;
  
  if (token) {
    const payload = await verifyToken(token);
    if (payload && payload.role === 'ADMIN') {
      const dbUser = await UserRepository.findById(payload.userId);
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
        };
      }
    }
  }
  
  // Eğer user yoksa, middleware zaten redirect yapmış olmalı
  // Ama yine de güvenlik için null kontrolü yapalım
  if (!user) {
    // Bu durumda middleware zaten redirect yapmış olmalı
    // Ama yine de bir fallback gösterelim
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Yetkilendirme hatası. Lütfen tekrar giriş yapın.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="text-xl font-bold">
              Aura Admin Panel
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="hover:text-pink-400 transition">
                Dashboard
              </Link>
              <Link href="/admin/categories" className="hover:text-pink-400 transition">
                Kategoriler
              </Link>
              <Link href="/admin/products" className="hover:text-pink-400 transition">
                Ürünler
              </Link>
              <Link href="/admin/attributes" className="hover:text-pink-400 transition">
                Ürün Özellikleri
              </Link>
              <Link href="/admin/orders" className="hover:text-pink-400 transition">
                Siparişler
              </Link>
              <Link href="/admin/reports" className="hover:text-pink-400 transition">
                Raporlar
              </Link>
              <Link href="/admin/randevular" className="hover:text-pink-400 transition">
                Randevular
              </Link>
              <Link href="/" className="hover:text-pink-400 transition">
                Siteye Dön
              </Link>
              
              {/* User Info & Logout */}
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-700">
                <span className="text-sm text-gray-300">
                  👤 {user?.name || user?.email}
                </span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Admin Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

