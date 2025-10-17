import Link from 'next/link';

export default function Navbar() {
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
            <Link href="/hizmetlerimiz" className="text-gray-700 hover:text-pink-600 transition">
              Hizmetlerimiz
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-pink-600 transition">
              Blog
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

          <Link 
            href="/randevu" 
            className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition"
          >
            Randevu Al
          </Link>
        </div>
      </div>
    </nav>
  );
}

