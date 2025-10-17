import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-pink-400 mb-4">Aura Güzellik</h3>
            <p className="text-gray-400">
              Güzelliğiniz için profesyonel hizmetler sunuyoruz.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li><Link href="/hizmetlerimiz" className="text-gray-400 hover:text-pink-400">Hizmetlerimiz</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-pink-400">Blog</Link></li>
              <li><Link href="/hakkimizda" className="text-gray-400 hover:text-pink-400">Hakkımızda</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Tel: +90 XXX XXX XX XX</li>
              <li>Email: info@aura.com</li>
              <li>Adres: İstanbul, Türkiye</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Sosyal Medya</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-pink-400">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-pink-400">Instagram</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Aura Güzellik Merkezi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

