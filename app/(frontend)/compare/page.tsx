'use client';

import { useCompare } from '@/app/context/CompareContext';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { showToast } from '@/components/ToastContainer';
import { useState, useEffect } from 'react';
import { getProductRating } from '@/app/server-actions/reviewActions';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addItem } = useCart();
  const [ratings, setRatings] = useState<Record<number, { average: number; count: number }>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  // Load ratings for all products
  useEffect(() => {
    const loadRatings = async () => {
      const ratingsData: Record<number, { average: number; count: number }> = {};
      for (const product of compareItems) {
        try {
          const result = await getProductRating(product.id);
          if (result.success && result.data) {
            ratingsData[product.id] = result.data;
          }
        } catch (error) {
          console.error(`Error loading rating for product ${product.id}:`, error);
        }
      }
      setRatings(ratingsData);
    };

    if (compareItems.length > 0) {
      loadRatings();
    }
  }, [compareItems]);

  const handleAddToCart = async (productId: number) => {
    setLoading(prev => ({ ...prev, [productId]: true }));
    try {
      await addItem(productId, 1);
      showToast('Ürün sepete eklendi!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Ürün sepete eklenirken bir hata oluştu', 'error');
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (compareItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Karşılaştırma Listesi Boş</h2>
            <p className="text-gray-600 mb-6">Karşılaştırmak istediğiniz ürünleri ekleyin</p>
            <Link
              href="/products"
              className="inline-block bg-accent-yellow text-primary-blue-dark px-6 py-3 rounded-lg font-bold hover:bg-accent-yellow-light transition-colors"
            >
              Ürünlere Göz At
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get all unique attributes to compare
  const attributes = ['Fiyat', 'Stok', 'Marka', 'SKU', 'Puan', 'Yorum Sayısı'];

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ürün Karşılaştırma</h1>
            <p className="text-gray-600">
              {compareItems.length} ürün karşılaştırılıyor (Maksimum 4 ürün)
            </p>
          </div>
          <button
            onClick={clearCompare}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm"
          >
            Listeyi Temizle
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-blue text-white">
                <tr>
                  <th className="px-4 py-4 text-left font-bold sticky left-0 bg-primary-blue z-10 min-w-[200px]">
                    Özellik
                  </th>
                  {compareItems.map((product) => (
                    <th key={product.id} className="px-4 py-4 text-center font-bold min-w-[250px]">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="ml-auto mb-2 text-white/80 hover:text-white transition-colors"
                          title="Kaldır"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <Link href={`/products/${product.slug}`} className="block">
                          <div className="relative w-32 h-32 mx-auto mb-3">
                            <Image
                              src={product.images[0] || '/placeholder-image.svg'}
                              alt={product.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <h3 className="font-bold text-sm mb-2 hover:text-accent-yellow transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Fiyat */}
                <tr>
                  <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                    Fiyat
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="px-4 py-4 text-center">
                      <span className="text-2xl font-extrabold text-primary-blue">
                        {product.price.toFixed(2)} ₺
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Stok */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                    Stok Durumu
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="px-4 py-4 text-center">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {product.stock > 10 ? 'Stokta' : `${product.stock} Adet`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          Stokta Yok
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Marka */}
                {compareItems.some(p => p.brand) && (
                  <tr>
                    <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                      Marka
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="px-4 py-4 text-center">
                        {product.brand || '-'}
                      </td>
                    ))}
                  </tr>
                )}

                {/* SKU */}
                {compareItems.some(p => p.sku) && (
                  <tr className="bg-gray-50">
                    <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                      SKU
                    </td>
                    {compareItems.map((product) => (
                      <td key={product.id} className="px-4 py-4 text-center font-mono text-sm">
                        {product.sku || '-'}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Puan */}
                <tr>
                  <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                    Puan
                  </td>
                  {compareItems.map((product) => {
                    const rating = ratings[product.id];
                    return (
                      <td key={product.id} className="px-4 py-4 text-center">
                        {rating && rating.count > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex text-accent-yellow">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.round(rating.average) ? 'fill-current' : 'fill-gray-300'}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {rating.average.toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Henüz değerlendirilmedi</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Yorum Sayısı */}
                <tr className="bg-gray-50">
                  <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                    Yorum Sayısı
                  </td>
                  {compareItems.map((product) => {
                    const rating = ratings[product.id];
                    return (
                      <td key={product.id} className="px-4 py-4 text-center">
                        {rating && rating.count > 0 ? (
                          <span className="text-sm font-semibold text-gray-700">{rating.count}</span>
                        ) : (
                          <span className="text-sm text-gray-400">0</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Sepete Ekle */}
                <tr>
                  <td className="px-4 py-4 font-semibold text-gray-700 sticky left-0 bg-white z-10">
                    İşlemler
                  </td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="px-4 py-4 text-center">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue-dark transition-colors font-semibold text-sm"
                        >
                          Detayları Gör
                        </Link>
                        {product.stock > 0 && (
                          <button
                            onClick={() => handleAddToCart(product.id)}
                            disabled={loading[product.id]}
                            className="px-4 py-2 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-colors font-bold text-sm disabled:opacity-50"
                          >
                            {loading[product.id] ? 'Ekleniyor...' : 'Sepete Ekle'}
                          </button>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

