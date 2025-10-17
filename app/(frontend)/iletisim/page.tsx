export default function IletisimPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">İletişim</h1>
      
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* İletişim Formu */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Bize Ulaşın</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Adınız Soyadınız
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Konu
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Mesajınız
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
              >
                Gönder
              </button>
            </form>
            
            <p className="text-center text-gray-500 text-sm mt-4">
              * Form işlevselliği yakında eklenecek
            </p>
          </div>
          
          {/* İletişim Bilgileri */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">📍 Adres</h3>
              <p className="text-gray-600">
                Örnek Mahallesi, Güzellik Sokak No:123<br />
                Kadıköy / İstanbul
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">📞 Telefon</h3>
              <p className="text-gray-600">
                +90 XXX XXX XX XX<br />
                +90 YYY YYY YY YY
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">📧 E-posta</h3>
              <p className="text-gray-600">
                info@auraguzellik.com<br />
                randevu@auraguzellik.com
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">🕐 Çalışma Saatleri</h3>
              <p className="text-gray-600">
                Pazartesi - Cumartesi: 09:00 - 20:00<br />
                Pazar: 10:00 - 18:00
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

