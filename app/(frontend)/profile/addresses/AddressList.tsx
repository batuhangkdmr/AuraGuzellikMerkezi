'use client';

import { useState } from 'react';
import { deleteAddress, setDefaultAddress } from '@/app/server-actions/addressActions';
import { showToast } from '@/components/ToastContainer';
import Link from 'next/link';

interface Address {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressListProps {
  initialAddresses: Address[];
}

export default function AddressList({ initialAddresses }: AddressListProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      return;
    }

    setDeletingId(id);
    const result = await deleteAddress(id);
    
    if (result.success) {
      setAddresses(addresses.filter(addr => addr.id !== id));
      showToast('Adres başarıyla silindi', 'success');
    } else {
      showToast(result.error || 'Adres silinirken bir hata oluştu', 'error');
    }
    setDeletingId(null);
  };

  const handleSetDefault = async (id: number) => {
    const result = await setDefaultAddress(id);
    
    if (result.success) {
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      })));
      showToast('Varsayılan adres güncellendi', 'success');
    } else {
      showToast(result.error || 'Varsayılan adres ayarlanırken bir hata oluştu', 'error');
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-gray-200">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz adres eklenmemiş</h3>
        <p className="text-gray-600 mb-8 text-lg">İlk adresinizi ekleyerek başlayın</p>
        <Link
          href="/profile/addresses/new"
          className="inline-block px-8 py-4 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold text-lg shadow-md hover:shadow-lg"
        >
          + Yeni Adres Ekle
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all ${
            address.isDefault
              ? 'border-accent-yellow bg-accent-yellow/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-extrabold text-gray-900">{address.title}</h3>
                {address.isDefault && (
                  <span className="px-2.5 py-1 bg-accent-yellow text-primary-blue-dark rounded-full text-xs font-bold">
                    Varsayılan
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-2 text-gray-700 mb-4">
            <p className="font-semibold text-gray-900">{address.fullName}</p>
            <p className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {address.phone}
            </p>
            <p className="text-sm leading-relaxed">{address.address}</p>
            <p className="text-sm">
              {address.postalCode} {address.city}, {address.country}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            {!address.isDefault && (
              <button
                onClick={() => handleSetDefault(address.id)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold text-sm"
              >
                Varsayılan Yap
              </button>
            )}
            <Link
              href={`/profile/addresses/${address.id}/edit`}
              className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-all font-semibold text-sm text-center"
            >
              Düzenle
            </Link>
            <button
              onClick={() => handleDelete(address.id)}
              disabled={deletingId === address.id}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm disabled:opacity-50"
            >
              {deletingId === address.id ? '...' : 'Sil'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

