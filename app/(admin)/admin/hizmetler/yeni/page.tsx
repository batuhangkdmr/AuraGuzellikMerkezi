import Link from 'next/link';
import ServiceForm from './ServiceForm';

export default function NewServicePage() {
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
      
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Yeni Hizmet Ekle</h1>
      
      <ServiceForm />
    </div>
  );
}

