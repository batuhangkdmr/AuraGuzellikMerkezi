import Link from 'next/link';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyToken } from '@/lib/auth/auth';
import { UserRepository } from '@/lib/repositories/UserRepository';
import LogoutButton from './LogoutButton';
import Sidebar from './components/Sidebar';

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
    <div className="min-h-screen bg-gray-50">
      {/* Admin Top Navbar */}
      <nav className="bg-primary-blue text-white shadow-lg border-b-2 border-accent-yellow sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-xl font-extrabold hover:text-accent-yellow transition">
                🏢 New Holland Admin
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition text-sm font-semibold"
              >
                🌐 Siteye Dön
              </Link>
              
              {/* User Info & Logout */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/20">
                <div className="w-8 h-8 bg-accent-yellow/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-yellow">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {user?.name || user?.email}
                </span>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
      
        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

