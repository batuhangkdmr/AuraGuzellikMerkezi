import Link from 'next/link';
import { getCurrentUser } from '@/app/auth/actions';
import LogoutButton from './LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mevcut kullanıcıyı al
  const user = await getCurrentUser();

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
              <Link href="/admin/blog" className="hover:text-pink-400 transition">
                Blog
              </Link>
              <Link href="/admin/hizmetler" className="hover:text-pink-400 transition">
                Hizmetler
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
                  👤 {user?.username}
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

