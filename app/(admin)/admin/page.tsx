export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm mb-2">Toplam Blog</div>
          <div className="text-3xl font-bold text-pink-600">0</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm mb-2">Toplam Hizmet</div>
          <div className="text-3xl font-bold text-purple-600">0</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm mb-2">Bekleyen Randevu</div>
          <div className="text-3xl font-bold text-blue-600">0</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm mb-2">Okunmamış Mesaj</div>
          <div className="text-3xl font-bold text-orange-600">0</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Son Randevular</h2>
          <p className="text-gray-500">Henüz randevu yok...</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Son Blog Yazıları</h2>
          <p className="text-gray-500">Henüz blog yazısı yok...</p>
        </div>
      </div>
    </div>
  );
}

