import Link from 'next/link';
import ServiceRepository from '@/lib/repositories/ServiceRepository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HizmetlerimizPage() {
  const services = await ServiceRepository.findPublished();

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Hizmetlerimiz</h1>
          <p className="text-xl text-pink-100 max-w-2xl mx-auto">
            Profesyonel ekibimiz ve lüks hizmetlerimizle güzelliğinize güzellik katıyoruz
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container mx-auto px-4 py-16">
        {services.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-xl">
              Henüz hizmet eklenmemiş. Yakında burada olacak!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/hizmetlerimiz/${service.slug}`}
                className="group"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  {/* Service Image */}
                  {service.image ? (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                        {service.title}
                      </h3>
                    </div>
                  ) : (
                    <div className="relative h-64 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <h3 className="text-2xl font-bold text-white text-center px-4">
                        {service.title}
                      </h3>
                    </div>
                  )}

                  {/* Service Content */}
                  <div className="p-6">
                    {service.excerpt ? (
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {service.excerpt}
                      </p>
                    ) : (
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {service.content.substring(0, 120)}...
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-pink-600 font-semibold group-hover:text-pink-700 transition">
                        Detayları Gör →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Randevunuzu Hemen Alın</h2>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Size özel hizmetlerimizden faydalanmak için hemen randevu oluşturun
          </p>
          <Link
            href="/randevu"
            className="inline-block bg-white text-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transition shadow-lg"
          >
            Randevu Al
          </Link>
        </div>
      </div>
    </div>
  );
}
