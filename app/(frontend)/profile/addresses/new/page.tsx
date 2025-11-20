import { requireUser } from '@/lib/requireUser';
import Link from 'next/link';
import AddressForm from '../AddressForm';

export default async function NewAddressPage() {
  await requireUser();

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/profile/addresses"
            className="text-primary-blue hover:text-primary-blue-dark mb-4 inline-flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Adreslerime Dön
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Yeni Adres Ekle</h1>
          <p className="text-gray-600">Yeni bir teslimat adresi ekleyin</p>
        </div>

        {/* Address Form */}
        <AddressForm />
      </div>
    </div>
  );
}

