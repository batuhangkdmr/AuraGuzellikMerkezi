'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '@/components/FavoriteButton';
import { getFavorites } from '@/app/server-actions/favoriteActions';

interface Favorite {
  id: number;
  userId: number;
  productId: number;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
  };
}

interface FavoritesClientProps {
  initialFavorites: Favorite[];
}

export default function FavoritesClient({ initialFavorites }: FavoritesClientProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Listen for favorite changes and refresh
  useEffect(() => {
    const handleFavoriteChange = async (event: Event) => {
      const customEvent = event as CustomEvent<{ productId: number; isFavorite: boolean }>;
      
      // If a favorite was removed, update the list immediately
      if (customEvent.detail?.isFavorite === false) {
        setFavorites(prev => prev.filter(fav => fav.productId !== customEvent.detail.productId));
      } else if (customEvent.detail?.isFavorite === true) {
        // If a favorite was added, refresh the list
        startTransition(async () => {
          const result = await getFavorites();
          if (result.success && result.data) {
            setFavorites(result.data);
          } else {
            // Fallback to router refresh
            router.refresh();
          }
        });
      } else {
        // General refresh
        startTransition(() => {
          router.refresh();
        });
      }
    };

    window.addEventListener('favoriteChanged', handleFavoriteChange);
    return () => window.removeEventListener('favoriteChanged', handleFavoriteChange);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Favorilerim</h1>
          {isPending && (
            <span className="text-sm text-gray-500">Güncelleniyor...</span>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-gray-600 text-lg mb-4">Henüz favori ürününüz yok</p>
            <Link
              href="/products"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition"
            >
              Ürünleri Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => {
              const images = favorite.product.images || [];
              const mainImage = images[0] || '/placeholder-image.svg';

              return (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <Link href={`/products/${favorite.product.slug}`} className="block">
                    {/* Product Image */}
                    <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                      <Image
                        src={mainImage}
                        alt={favorite.product.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      
                      {/* Favorite Button */}
                      <div className="absolute top-2 right-2 z-10">
                        <FavoriteButton productId={favorite.product.id} size="md" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                        {favorite.product.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-pink-600">
                          {favorite.product.price.toFixed(2)} ₺
                        </span>
                        {favorite.product.stock > 0 ? (
                          <span className="text-xs text-green-600">Stokta var</span>
                        ) : (
                          <span className="text-xs text-red-600">Stokta yok</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

