import { requireUser } from '@/lib/requireUser';
import { getUserAddresses } from '@/app/server-actions/addressActions';
import Link from 'next/link';
import AddressList from './AddressList';

export default async function AddressesPage() {
  const user = await requireUser();

  const addressesResult = await getUserAddresses();
  const addresses = addressesResult.success && addressesResult.data ? addressesResult.data : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Adreslerim</h1>
              <p className="text-gray-600">Teslimat adreslerinizi yönetin</p>
            </div>
            <Link
              href="/profile/addresses/new"
              className="px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold shadow-md hover:shadow-lg"
            >
              + Yeni Adres Ekle
            </Link>
          </div>
        </div>

        {/* Addresses List */}
        <AddressList initialAddresses={addresses} />
      </div>
    </div>
  );
}

