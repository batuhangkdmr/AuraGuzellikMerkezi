'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
    description?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const images = product.images || [];
  const mainImage = images[0] || '/placeholder-image.svg';
  const hoverImage = images[1] || mainImage;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding || product.stock <= 0) return;
    
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      // You could show a toast notification here
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className="relative h-64 w-full overflow-hidden bg-gray-100">
          <Image
            src={hovered ? hoverImage : mainImage}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 ${
              hovered ? 'scale-110' : 'scale-100'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.stock > 10 && (
              <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">
                Kargo Bedava
              </span>
            )}
            {product.stock > 5 && (
              <span className="px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded">
                Sepette İndirim
              </span>
            )}
          </div>

          {/* Stock Badge */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Stokta Yok</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          {/* Rating (Mock) */}
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">(4.8)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-pink-600">
                {product.price.toFixed(2)} ₺
              </span>
            </div>
            {product.stock > 0 && (
              <span className="text-xs text-green-600">Stokta var</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button - Outside Link to prevent navigation */}
      {product.stock > 0 && (
        <div className="p-4 pt-0">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? 'Ekleniyor...' : 'Sepete Ekle'}
          </button>
        </div>
      )}
    </div>
  );
}

