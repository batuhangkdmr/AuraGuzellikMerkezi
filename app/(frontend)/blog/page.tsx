import Link from 'next/link';
import BlogRepository from '@/lib/repositories/BlogRepository';

export default async function BlogPage() {
  const blogs = await BlogRepository.findPublished();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Blog</h1>
      
      <p className="text-gray-600 text-center mb-12">
        Güzellik ve bakım hakkında en son ipuçları ve haberler.
      </p>

      {blogs.length === 0 ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg text-center">
            <p className="font-semibold mb-2">✅ Veritabanı bağlantısı başarılı!</p>
            <p className="text-sm">Henüz yayınlanmış blog yazısı bulunmuyor. Admin panelinden blog ekleyebilirsiniz.</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link 
              key={blog.id}
              href={`/blog/${blog.slug}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              {blog.image && (
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 hover:text-pink-600 transition-colors">
                  {blog.title}
                </h2>
                {blog.excerpt && (
                  <p className="text-gray-600 text-sm mb-4">{blog.excerpt}</p>
                )}
                <p className="text-pink-500 text-sm font-medium">
                  Devamını Oku →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
