import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/requireUser';
import { getUserAddresses } from '@/app/server-actions/addressActions';
import Link from 'next/link';
import AddressForm from './AddressForm';

export default async function EditAddressPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser();
  
  const addressId = parseInt(params.id, 10);
  if (isNaN(addressId)) {
    notFound();
  }

  const addressesResult = await getUserAddresses();
  const addresses = addressesResult.success && addressesResult.data ? addressesResult.data : [];
  const address = addresses.find(addr => addr.id === addressId);

  if (!address) {
    notFound();
  }

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
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Adresi Düzenle</h1>
          <p className="text-gray-600">Adres bilgilerinizi güncelleyin</p>
        </div>

        {/* Address Form */}
        <AddressForm address={address} />
      </div>
    </div>
  );
}

