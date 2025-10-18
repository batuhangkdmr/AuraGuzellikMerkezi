import Link from 'next/link';
import { getBlogs } from './actions';
import DeleteButton from './DeleteButton';

// Force dynamic rendering - cache'i devre dışı bırak
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminBlogPage() {
  const result = await getBlogs();
  const blogs = result.success ? result.data : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Blog Yönetimi</h1>
        <Link 
          href="/admin/blog/yeni"
          className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
        >
          + Yeni Blog Ekle
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {blogs && blogs.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Başlık</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {blogs.map((blog: any) => (
                <tr key={blog.id}>
                  <td className="px-6 py-4">
                    {blog.image ? (
                      <img 
                        src={blog.image} 
                        alt={blog.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Resim Yok</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{blog.title}</td>
                  <td className="px-6 py-4">
                    {blog.published ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Yayında
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        Taslak
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(blog.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/admin/blog/duzenle/${blog.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Düzenle
                    </Link>
                    <DeleteButton blogId={blog.id} blogTitle={blog.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Henüz blog yazısı yok. Yeni bir blog ekleyin!
          </div>
        )}
      </div>
    </div>
  );
}

