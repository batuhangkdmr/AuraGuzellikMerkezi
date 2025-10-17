export default function RandevuPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Randevu Al</h1>
      
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Adınız Soyadınız
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                placeholder="Adınız Soyadınız"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Telefon
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                placeholder="+90 XXX XXX XX XX"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                E-posta
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                placeholder="ornek@email.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Hizmet
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent">
                <option>Hizmet Seçiniz</option>
                <option>Cilt Bakımı</option>
                <option>Manikür & Pedikür</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Saat
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Notlar (Opsiyonel)
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                placeholder="Özel bir isteğiniz varsa buraya yazabilirsiniz..."
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Randevu Oluştur
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            * Form işlevselliği yakında eklenecek
          </p>
        </div>
      </div>
    </div>
  );
}

