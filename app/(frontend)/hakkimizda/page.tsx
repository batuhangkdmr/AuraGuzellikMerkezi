export default function HakkimizdaPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Hakkımızda</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Aura Güzellik Merkezi</h2>
          <p className="text-gray-600 mb-4">
            2024 yılında kurulan Aura Güzellik Merkezi, müşterilerine en kaliteli 
            güzellik ve bakım hizmetlerini sunmayı hedefleyen bir kuruluştur.
          </p>
          <p className="text-gray-600 mb-4">
            Deneyimli ve profesyonel ekibimizle, müşteri memnuniyetini ön planda tutarak 
            hizmet vermekteyiz.
          </p>
          
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-3">Vizyonumuz</h3>
            <p className="text-gray-600 mb-4">
              Türkiye'nin en güvenilir ve kaliteli güzellik merkezi olmak.
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-3">Misyonumuz</h3>
            <p className="text-gray-600">
              Müşterilerimize en son teknoloji ve profesyonel hizmetle güzelliklerine 
              kavuşmalarını sağlamak.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

