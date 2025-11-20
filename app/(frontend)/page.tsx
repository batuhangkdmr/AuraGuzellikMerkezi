import Link from 'next/link';
import { getAllProducts } from '@/app/server-actions/productActions';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/SkeletonLoader';
import { Suspense } from 'react';

export default async function HomePage() {
  // Get first 8 products for homepage
  const productsResult = await getAllProducts();
  const products = productsResult.success && productsResult.data 
    ? productsResult.data.slice(0, 8)
    : [];

  return (
    <div>
      {/* Hero Section - New Holland Official Style */}
      <section className="relative bg-primary-blue text-white overflow-hidden">
        {/* Yellow Top Bar */}
        <div className="absolute top-0 left-0 w-full h-4 bg-accent-yellow"></div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-6 animate-fadeInUp">
              <span className="inline-block bg-accent-yellow text-primary-blue-dark px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                NEW HOLLAND YEDEK PARÇA
              </span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 text-white leading-tight animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              New Holland Yedek Parça Bayi
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl lg:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto font-medium leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              Orijinal New Holland yedek parçaları ve profesyonel servis hizmetleri ile yanınızdayız
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <Link 
                href="/products" 
                className="bg-accent-yellow text-primary-blue-dark px-8 py-4 rounded-lg text-lg font-bold hover:bg-accent-yellow-light transition-all transform hover:scale-105 shadow-2xl hover:shadow-accent-yellow/50 min-w-[200px]"
              >
                Ürünleri Keşfet
              </Link>
              <Link 
                href="/randevu" 
                className="bg-white text-primary-blue px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl border-2 border-accent-yellow min-w-[200px]"
              >
                Randevu Al
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Yellow Bar */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-accent-yellow"></div>
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-64 h-64 bg-accent-yellow rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent-yellow rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section - New Holland Style */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 relative">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: '✓',
                title: 'Orijinal Yedek Parça',
                desc: '100% orijinal New Holland yedek parçaları',
                color: 'from-blue-500 to-blue-600'
              },
              {
                icon: '🚚',
                title: 'Hızlı Kargo',
                desc: 'Türkiye geneli hızlı ve güvenli teslimat',
                color: 'from-yellow-500 to-yellow-600'
              },
              {
                icon: '🛡️',
                title: 'Garanti',
                desc: 'Tüm ürünlerde resmi garanti belgesi',
                color: 'from-green-500 to-green-600'
              },
              {
                icon: '💳',
                title: 'Güvenli Ödeme',
                desc: 'SSL ile korumalı ödeme sistemi',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 text-center">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Section - New Holland Style */}
      {products.length > 0 && (
        <section className="py-20 bg-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent-yellow"></div>
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-blue mb-4">
                Öne Çıkan Ürünler
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
                New Holland yedek parça serileri ile kalite ve güvenilirlik bir arada
              </p>
              <div className="h-1 w-24 bg-accent-yellow rounded mx-auto"></div>
            </div>
            
            {/* Products Grid - Professional Layout */}
            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-10">
                {products.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </Suspense>

            {/* View All Button */}
            <div className="flex justify-center">
              <Link 
                href="/products" 
                className="bg-accent-yellow text-primary-blue-dark px-10 py-4 rounded-lg hover:bg-accent-yellow-light font-bold transition-all transform hover:scale-105 shadow-lg text-lg flex items-center gap-2"
              >
                <span>Tüm Ürünleri İncele</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-primary-blue via-primary-blue-dark to-primary-blue relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-accent-yellow rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent-yellow rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
              New Holland yedek parça konusunda uzman ekibimiz ve geniş ürün yelpazemiz ile yanınızdayız
            </p>
            <div className="h-1 w-32 bg-accent-yellow rounded mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                number: '01',
                title: 'Geniş Ürün Yelpazesi',
                desc: 'Binlerce farklı yedek parça çeşidi ile tüm ihtiyaçlarınızı karşılıyoruz.',
                icon: '📦'
              },
              {
                number: '02',
                title: 'Uzman Ekip',
                desc: 'Yılların deneyimi ile New Holland konusunda uzmanlaşmış ekibimiz.',
                icon: '👨‍🔧'
              },
              {
                number: '03',
                title: 'Hızlı Çözüm',
                desc: 'Hızlı sipariş işleme ve kargo ile en kısa sürede ürünlerinize kavuşun.',
                icon: '⚡'
              },
              {
                number: '04',
                title: 'Müşteri Memnuniyeti',
                desc: '%98 müşteri memnuniyeti oranı ile güvenilir hizmet sunuyoruz.',
                icon: '⭐'
              },
              {
                number: '05',
                title: 'Teknik Destek',
                desc: '7/24 teknik destek hattımız ile her zaman yanınızdayız.',
                icon: '📞'
              },
              {
                number: '06',
                title: 'Uygun Fiyat',
                desc: 'En uygun fiyat garantisi ile bütçenize uygun çözümler sunuyoruz.',
                icon: '💰'
              }
            ].map((item, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border-2 border-accent-yellow/30 hover:border-accent-yellow hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="text-3xl font-extrabold text-accent-yellow">{item.number}</div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-200 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Satış Sonrası Hizmetler - New Holland Style */}
      <section className="py-20 bg-primary-blue text-white relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent-yellow"></div>
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-white">
              Satış Sonrası Hizmetler
            </h2>
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-6">
              New Holland Yetkili Servisleri, Türkiye genelinde geniş servis ağı ile yanınızda. 
              Orijinal yedek parça kullanımı ve profesyonel bakım hizmetleri ile traktörünüzün ömrünü uzatın.
            </p>
            <div className="h-1 w-32 bg-accent-yellow rounded mx-auto"></div>
          </div>
          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: '🔧', 
                title: 'Yedek Parça', 
                desc: 'Orijinal New Holland yedek parça kullanımı traktörünüzün ömrünü uzatır.',
                link: '/products',
                linkText: 'Detaylı İncele'
              },
              { 
                icon: '⚙️', 
                title: 'Servis', 
                desc: 'Geniş servis ağı ve profesyonel ekibimiz ile ne zaman isterseniz yanındayız.',
                link: '/randevu',
                linkText: 'Detaylı İncele'
              },
              { 
                icon: '🛡️', 
                title: 'Uzatılmış Garanti', 
                desc: 'Uzatılmış Garanti ile traktörünüzü güvenceye alın.',
                link: '/iletisim',
                linkText: 'Detaylı İncele'
              }
            ].map((service, index) => (
              <div 
                key={index}
                className="bg-primary-blue-dark p-8 rounded-2xl shadow-2xl text-center border-2 border-accent-yellow/30 hover:border-accent-yellow hover:shadow-accent-yellow/30 hover:transform hover:scale-105 transition-all duration-300 animate-fadeInUp group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Icon Container */}
                <div className="bg-accent-yellow/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border-4 border-accent-yellow group-hover:bg-accent-yellow/30 transition-all">
                  <div className="text-6xl">{service.icon}</div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-extrabold mb-4 text-white">{service.title}</h3>
                
                {/* Description */}
                <p className="text-white leading-relaxed mb-6 min-h-[60px]">{service.desc}</p>
                
                {/* Link */}
                <Link 
                  href={service.link}
                  className="inline-block bg-accent-yellow text-primary-blue-dark px-6 py-2 rounded-lg font-bold hover:bg-accent-yellow-light transition-all transform hover:scale-105"
                >
                  {service.linkText} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium Gradient Design */}
      <section className="relative bg-gradient-to-br from-accent-yellow via-accent-yellow-light to-accent-yellow py-24 md:py-32 overflow-hidden">
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary-blue rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-blue-dark rounded-full blur-3xl"></div>
        </div>
        
        {/* Top Border with Gradient */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary-blue via-primary-blue-dark to-primary-blue"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="mb-6 inline-block animate-fadeInUp">
            <span className="bg-primary-blue text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-primary-blue-dark">
              ✨ PROFESYONEL DESTEK
            </span>
          </div>
          
          {/* Main Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-primary-blue-dark drop-shadow-lg animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Size Nasıl Yardımcı Olabiliriz?
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl mb-12 font-semibold max-w-3xl mx-auto text-primary-blue-dark/90 leading-relaxed animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            Profesyonel ekibimizle hizmetinizdeyiz. Yedek parça ihtiyaçlarınız için bizimle iletişime geçin.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <Link 
              href="/randevu" 
              className="group relative bg-primary-blue text-white px-12 py-5 rounded-xl text-lg font-bold hover:bg-primary-blue-dark transition-all transform hover:scale-110 shadow-2xl hover:shadow-primary-blue/50 border-4 border-primary-blue-dark overflow-hidden min-w-[240px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Hemen Randevu Al
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-blue-dark to-primary-blue opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            
            <Link 
              href="/iletisim" 
              className="group relative bg-white text-primary-blue-dark px-12 py-5 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all transform hover:scale-110 shadow-2xl hover:shadow-primary-blue/30 border-4 border-primary-blue overflow-hidden min-w-[240px]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                İletişime Geç
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent-yellow/20 to-accent-yellow/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
          
          {/* Quick Contact Info */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-center animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border-2 border-primary-blue/20">
              <div className="bg-primary-blue rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs text-primary-blue-dark/70 font-semibold uppercase">Telefon</div>
                <div className="font-bold text-primary-blue-dark text-lg">444 0 648</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border-2 border-primary-blue/20">
              <div className="bg-primary-blue rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs text-primary-blue-dark/70 font-semibold uppercase">E-posta</div>
                <div className="font-bold text-primary-blue-dark text-sm">info@newhollandbayi.com</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Border with Gradient */}
        <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-primary-blue via-primary-blue-dark to-primary-blue"></div>
      </section>
    </div>
  );
}

