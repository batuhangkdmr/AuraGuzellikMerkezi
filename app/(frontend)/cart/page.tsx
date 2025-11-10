'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/app/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/app/auth/actions';

export default function CartPage() {
  const { items, isLoading, removeItem, updateQuantity, getTotal, getItemCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
      setCheckingAuth(false);
    }
    checkAuth();
  }, []);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Sepetim</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Sepetiniz boş</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sepetim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const mainImage = item.product.images[0] || 'https://via.placeholder.com/200x200?text=No+Image';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-4"
                >
                  <div className="relative h-32 w-32 flex-shrink-0">
                    <Image
                      src={mainImage}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="128px"
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.product.name}
                    </h3>
                    <p className="text-pink-600 font-bold mb-4">
                      {item.product.price.toFixed(2)} ₺
                    </p>

                    <div className="flex items-center gap-4">
                      <label htmlFor={`quantity-${item.id}`} className="text-gray-700">
                        Miktar:
                      </label>
                      <input
                        id={`quantity-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value, 10);
                          if (!isNaN(qty) && qty >= 1) {
                            updateQuantity(item.id, qty);
                          }
                        }}
                        className="w-20 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {(item.product.price * item.quantity).toFixed(2)} ₺
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Özeti</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Toplam Ürün ({itemCount} adet)</span>
                  <span>{total.toFixed(2)} ₺</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Toplam</span>
                  <span>{total.toFixed(2)} ₺</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-semibold"
              >
                Ödemeye Geç
              </button>

              <Link
                href="/products"
                className="block mt-4 text-center text-pink-600 hover:text-pink-700 text-sm"
              >
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

