export default function AdminHizmetlerPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hizmetler Yönetimi</h1>
        <button className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition">
          + Yeni Hizmet Ekle
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">Henüz hizmet eklenmemiş...</p>
          <p className="text-sm text-gray-400 mt-2">
            * CRUD işlemleri yakında eklenecek
          </p>
        </div>
      </div>
    </div>
  );
}

