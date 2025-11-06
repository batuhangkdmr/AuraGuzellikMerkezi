import { notFound } from 'next/navigation';
import Link from 'next/link';
import ServiceRepository from '@/lib/repositories/ServiceRepository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = await ServiceRepository.findBySlug(params.slug);

  if (!service || !service.published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Sticky Contact Bar - Floating */}
      <div className="fixed top-24 right-4 z-50 hidden lg:flex flex-col gap-3 animate-[slideInRight_0.6s_ease-out]">
        <a
          href="/randevu"
          className="group relative bg-gradient-to-r from-[#EFC6B5] to-[#F0CCBB] text-white p-4 rounded-2xl shadow-2xl hover:shadow-[#F0CCBB]/50 transition-all duration-300 hover:scale-110"
          title="Randevu Al"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Randevu Al
          </span>
        </a>
        
        <a
          href="tel:+905358720278"
          className="group relative bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110"
          title="Bilgi Al"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Bilgi Al
          </span>
        </a>
        
        <a
          href="https://wa.me/905358720278"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110"
          title="WhatsApp"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            WhatsApp
          </span>
        </a>
      </div>

      {/* Back Button */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link 
            href="/hizmetlerimiz" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors group"
          >
            <svg className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium text-sm sm:text-base">Hizmetlere Dön</span>
          </Link>
        </div>
      </div>

      {/* Hero Image - Full Width */}
      {service.image && (
        <div className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover animate-[zoomIn_0.8s_ease-out]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 animate-[slideUp_0.6s_ease-out] break-words leading-tight">
                {service.title}
              </h1>
              {service.excerpt && (
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-200 max-w-3xl animate-[slideUp_0.8s_ease-out] break-words leading-relaxed">
                  {service.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none">
              {service.content.split('\n').map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                const isHeading = trimmed.endsWith(':') || (trimmed.length < 60 && /^[A-ZÇĞİÖŞÜ\s]+$/.test(trimmed));

                if (isHeading) {
                  return (
                    <h2 
                      key={index} 
                      className="text-2xl sm:text-3xl font-bold text-gray-900 mt-10 first:mt-0 mb-6 pb-3 border-b-2 border-pink-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {trimmed}
                    </h2>
                  );
                }

                if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                  return (
                    <div 
                      key={index} 
                      className="flex gap-3 mb-4 animate-[fadeIn_0.6s_ease-out]"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span className="text-pink-500 flex-shrink-0 text-xl">✓</span>
                      <p className="text-gray-700 text-lg leading-relaxed">
                        {trimmed.replace(/^[•-]\s*/, '')}
                      </p>
                    </div>
                  );
                }

                return (
                  <p 
                    key={index} 
                    className="text-gray-700 text-lg leading-relaxed mb-6 animate-[fadeIn_0.6s_ease-out]"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Primary CTA */}
              <div className="bg-gradient-to-br from-[#F7EEE8] to-[#F0CCBB] rounded-3xl p-8 shadow-2xl animate-[slideUp_0.6s_ease-out]">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <span className="text-4xl">✨</span>
                  </div>
                  <h3 className="text-xl font-bold mb-6 leading-tight text-gray-800">
                    ÜCRETSİZ ÖN GÖRÜŞME RANDEVUSU OLUŞTUR
                  </h3>
                  <Link
                    href="/randevu"
                    className="block w-full bg-[#EFC6B5] text-white py-4 rounded-full font-bold hover:bg-[#F0CCBB] transition-all hover:scale-105 shadow-lg"
                  >
                    Randevu Al
                  </Link>
                </div>
              </div>

              {/* Contact Methods */}
              <div className="bg-gray-50 rounded-3xl p-6 space-y-4 animate-[slideUp_0.8s_ease-out]">
                <h4 className="font-bold text-gray-900 text-lg mb-4">Hemen İletişime Geçin</h4>
                
                <a
                  href="tel:+905358720278"
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Hemen Ara</p>
                    <p className="font-bold text-gray-900">0535 872 0278</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/905358720278"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white p-4 rounded-2xl hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
                    <p className="font-bold text-gray-900">Mesaj Gönder</p>
                  </div>
                </a>
              </div>

              {/* Info Box */}
              <div className="bg-[#F7E0D4] border border-[#F0CCBB] rounded-3xl p-6 animate-[slideUp_1s_ease-out]">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>Neden Biz?</span>
                </h4>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#D7B596]">✓</span>
                    <span>Uzman ve deneyimli kadro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D7B596]">✓</span>
                    <span>Premium kalite ürünler</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D7B596]">✓</span>
                    <span>Hijyenik ve steril ortam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#D7B596]">✓</span>
                    <span>Ücretsiz danışmanlık</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
