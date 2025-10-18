import BlogRepository from '@/lib/repositories/BlogRepository';
import { notFound } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogDetayPage({ params }: { params: { slug: string } }) {
  // EF: context.Blogs.FirstOrDefaultAsync(b => b.Slug == slug && b.Published)
  const blog = await BlogRepository.findBySlug(params.slug);

  if (!blog || !blog.published) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        
        <div className="flex items-center text-gray-500 text-sm mb-8">
          <span>
            {new Date(blog.createdAt).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        {blog.image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={blog.image} 
              alt={blog.title}
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {blog.content}
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <a href="/blog" className="text-pink-600 hover:text-pink-700 font-semibold">
            ← Tüm Blog Yazılarına Dön
          </a>
        </div>
      </article>
    </div>
  );
}

