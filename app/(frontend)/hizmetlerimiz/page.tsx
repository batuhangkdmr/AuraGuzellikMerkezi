export default function HizmetlerimizPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Hizmetlerimiz</h1>
      
      <div className="max-w-4xl mx-auto">
        <p className="text-gray-600 text-center mb-12">
          Profesyonel güzellik hizmetlerimizle size özel çözümler sunuyoruz.
        </p>
        
        {/* Hizmetler burada listelenecek (database'den gelecek) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Cilt Bakımı</h3>
            <p className="text-gray-600 mb-4">Profesyonel cilt bakımı hizmetleri</p>
            <p className="text-pink-600 font-bold">₺500 - 60 dakika</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Manikür & Pedikür</h3>
            <p className="text-gray-600 mb-4">Kalıcı oje ve bakım hizmetleri</p>
            <p className="text-pink-600 font-bold">₺300 - 45 dakika</p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-500 italic">
            * Hizmetler admin panelinden yönetilecek (yakında...)
          </p>
        </div>
      </div>
    </div>
  );
}

