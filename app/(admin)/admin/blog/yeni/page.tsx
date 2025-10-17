import BlogForm from './BlogForm';

export default function YeniBlogPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Yeni Blog Ekle</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <BlogForm />
      </div>
    </div>
  );
}

