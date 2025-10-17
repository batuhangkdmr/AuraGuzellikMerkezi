import { getBlog } from '../../actions';
import { notFound } from 'next/navigation';
import EditBlogForm from './EditBlogForm';

export default async function DuzenleBlogPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const result = await getBlog(id);
  
  if (!result.success || !result.data) {
    notFound();
  }
  
  const blog = result.data;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Blog Düzenle</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <EditBlogForm blog={blog} />
      </div>
    </div>
  );
}

