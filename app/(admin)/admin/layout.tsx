import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin" className="text-xl font-bold">
              Aura Admin Panel
            </Link>
            
            <div className="flex space-x-6">
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

