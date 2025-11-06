import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getService } from '../../actions';
import EditServiceForm from './EditServiceForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    notFound();
  }

  const service = await getService(id);

  if (!service) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/hizmetler"
          className="text-pink-600 hover:text-pink-700 transition"
        >
          ← Hizmetlere Geri Dön
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Hizmet Düzenle</h1>
      
      <EditServiceForm service={service} />
    </div>
  );
}

