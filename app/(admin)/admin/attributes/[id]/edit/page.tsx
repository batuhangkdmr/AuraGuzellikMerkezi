import { getAttributeById } from '@/app/server-actions/attributeActions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EditAttributeForm from './EditAttributeForm';

export default async function EditAttributePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const attributeId = parseInt(id, 10);
  
  if (isNaN(attributeId)) {
    notFound();
  }

  const attributeResult = await getAttributeById(attributeId);
  if (!attributeResult.success || !attributeResult.data) {
    notFound();
  }

  const attribute = attributeResult.data;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Özellik Düzenle: {attribute.name}</h1>
          <Link
            href="/admin/attributes"
            className="text-pink-600 hover:text-pink-700"
          >
            ← Geri Dön
          </Link>
        </div>

        <EditAttributeForm attribute={attribute} />
      </div>
    </div>
  );
}

