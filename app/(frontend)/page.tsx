import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Aura Güzellik Merkezi</h1>
          <p className="text-xl mb-8">Güzelliğiniz bizim işimiz</p>
          <Link 
            href="/randevu" 
            className="bg-white text-pink-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Randevu Al
          </Link>
        </div>
      </section>

      {/* Hizmetlerimiz Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Hizmetlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">💆‍♀️</div>
              <h3 className="text-xl font-semibold mb-2">Cilt Bakımı</h3>
              <p className="text-gray-600">Profesyonel cilt bakımı hizmetleri</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">💅</div>
              <h3 className="text-xl font-semibold mb-2">Tırnak Bakımı</h3>
              <p className="text-gray-600">Manikür ve pedikür hizmetleri</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">Güzellik Bakımı</h3>
              <p className="text-gray-600">Kapsamlı güzellik hizmetleri</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/hizmetlerimiz" className="text-pink-600 font-semibold hover:underline">
              Tüm Hizmetleri Gör →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Randevunuzu Şimdi Alın</h2>
          <p className="text-gray-600 mb-8">Profesyonel ekibimizle güzelliğinize kavuşun</p>
          <Link 
            href="/randevu" 
            className="bg-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-pink-700 transition inline-block"
          >
            Hemen Randevu Al
          </Link>
        </div>
      </section>
    </div>
  );
}

