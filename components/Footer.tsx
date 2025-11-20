import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-blue-dark text-white mt-20 relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-accent-yellow"></div>
      <div className="container mx-auto px-4 py-12 pt-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-accent-yellow mb-4">New Holland Yedek Parça Bayi</h3>
            <p className="text-gray-300 leading-relaxed">
              Kaliteli yedek parça ve aksesuar çözümleri sunuyoruz.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li><Link href="/hakkimizda" className="text-gray-400 hover:text-accent-yellow">Hakkımızda</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Tel: +90 XXX XXX XX XX</li>
              <li>Email: info@newhollandbayi.com</li>
              <li>Adres: İstanbul, Türkiye</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Sosyal Medya</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-accent-yellow">Facebook</a>
              <a href="#" className="text-gray-400 hover:text-accent-yellow">Instagram</a>
            </div>
          </div>
        </div>
        
        <div className="border-t-2 border-accent-yellow mt-8 pt-8 text-center">
          <p className="text-gray-300">&copy; 2024 New Holland Yedek Parça Bayi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

