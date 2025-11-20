'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/app/context/CartContext';
import { useCompare } from '@/app/context/CompareContext';
import FavoriteButton from './FavoriteButton';
import { showToast } from './ToastContainer';
import { getProductRating } from '@/app/server-actions/reviewActions';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
    description?: string;
    categoryPath?: string;
    brand?: string;
    sku?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null);
  const { addItem } = useCart();
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useCompare();
  const images = product.images || [];
  const mainImage = images[0] || '/placeholder-image.svg';
  const hoverImage = images[1] || mainImage;

  // Load product rating
  useEffect(() => {
    const loadRating = async () => {
      try {
        const result = await getProductRating(product.id);
        if (result.success && result.data) {
          setRating(result.data);
        }
      } catch (error) {
        console.error('Error loading rating:', error);
      }
    };
    loadRating();
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding || product.stock <= 0) return;
    
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      showToast(`${product.name} sepete eklendi!`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Ürün sepete eklenirken bir hata oluştu', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
      showToast(`${product.name} karşılaştırmadan çıkarıldı`, 'info');
    } else {
      if (!canAddMore) {
        showToast(`En fazla 4 ürün karşılaştırabilirsiniz`, 'error');
        return;
      }
      const success = addToCompare({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        images: product.images,
        stock: product.stock,
        description: product.description,
        brand: product.brand,
        sku: product.sku,
        categoryPath: product.categoryPath,
      });
      if (success) {
        showToast(`${product.name} karşılaştırmaya eklendi`, 'success');
      }
    }
  };

  return (
    <div
      className="group relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-accent-yellow/50 transition-all duration-300 flex flex-col transform hover:-translate-y-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/5 to-primary-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      
      <Link href={`/products/${product.slug}`} className="block flex-1 flex flex-col relative z-10">
        {/* Product Image Container - Wider Aspect Ratio */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-white">
          <Image
            src={hovered ? hoverImage : mainImage}
            alt={product.name}
            fill
            className={`object-contain transition-all duration-500 ${
              hovered ? 'scale-105 brightness-105' : 'scale-100'
            }`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
          />
          
          {/* Gradient Overlay on Hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-500 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}></div>
          
          {/* Favorite & Compare Buttons */}
          <div className="absolute top-3 right-3 z-20 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-white transition-all">
              <FavoriteButton productId={product.id} size="md" />
            </div>
            <button
              onClick={handleToggleCompare}
              className={`bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg hover:bg-white transition-all ${
                isInCompare(product.id) ? 'text-accent-yellow' : 'text-gray-600'
              }`}
              title={isInCompare(product.id) ? 'Karşılaştırmadan Çıkar' : 'Karşılaştırmaya Ekle'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </button>
          </div>
          
          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product.stock > 10 && (
              <span className="px-3 py-1.5 bg-accent-yellow text-primary-blue-dark text-xs font-bold rounded-full shadow-xl backdrop-blur-sm border-2 border-white/50 animate-pulse">
                🚚 Kargo Bedava
              </span>
            )}
            {product.stock > 5 && product.stock <= 10 && (
              <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-xl backdrop-blur-sm border-2 border-white/50">
                ⚡ Hızlı Teslimat
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-xl backdrop-blur-sm border-2 border-white/50">
                ⚠️ Son {product.stock} Adet
              </span>
            )}
            {rating && rating.average >= 4.5 && rating.count >= 5 && (
              <span className="px-3 py-1.5 bg-purple-500 text-white text-xs font-bold rounded-full shadow-xl backdrop-blur-sm border-2 border-white/50">
                ⭐ Çok Beğenilen
              </span>
            )}
          </div>

          {/* Stock Badge Overlay */}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="text-center">
                <span className="bg-accent-yellow text-primary-blue-dark px-6 py-3 rounded-xl font-bold text-base shadow-2xl border-4 border-white/50">
                  Stokta Yok
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="p-5 flex-1 flex flex-col bg-white relative">
          {/* Product Path (Breadcrumb) & Brand */}
          <div className="mb-2 flex items-center justify-between gap-2">
            {product.categoryPath && (
              <p className="text-xs text-gray-500 line-clamp-1 font-medium flex-1">
                {product.categoryPath}
              </p>
            )}
            {product.brand && (
              <span className="text-xs bg-primary-blue/10 text-primary-blue px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                {product.brand}
              </span>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-primary-blue transition-colors duration-300 leading-tight">
            {product.name}
          </h3>
          
          {/* SKU */}
          {product.sku && (
            <div className="mb-2">
              <span className="text-xs text-gray-400 font-mono">SKU: {product.sku}</span>
            </div>
          )}
          
          {/* Rating & Stock Info */}
          <div className="flex items-center justify-between mb-4">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              {rating && rating.count > 0 ? (
                <>
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
                  <span className="text-xs text-gray-600 font-semibold">
                    ({rating.average.toFixed(1)})
                  </span>
                  <span className="text-xs text-gray-400">
                    ({rating.count})
                  </span>
                </>
              ) : (
                <>
                  <div className="flex text-gray-300">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">Henüz değerlendirilmedi</span>
                </>
              )}
            </div>
            
            {/* Stock Status */}
            {product.stock > 0 ? (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border ${
                product.stock > 10 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : product.stock > 5
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  product.stock > 10 
                    ? 'bg-green-500' 
                    : product.stock > 5
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
                }`}></span>
                {product.stock > 10 ? 'Stokta' : `${product.stock} Adet`}
              </span>
            ) : null}
          </div>

          {/* Price Section */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-extrabold text-primary-blue">
                  {product.price.toFixed(2)}
                </span>
                <span className="text-base text-gray-500 ml-1">₺</span>
              </div>
              {product.stock > 0 && (
                <span className="text-xs text-green-600 font-semibold">
                  KDV Dahil
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons - Enhanced Design */}
      <div className="px-5 pb-5 pt-0 bg-white relative z-10">
        {product.stock > 0 ? (
          <div className="flex gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 group/view relative bg-white border-2 border-primary-blue text-primary-blue py-3 px-4 rounded-lg hover:bg-primary-blue hover:text-white transition-all font-semibold text-sm shadow-sm hover:shadow-md transform hover:scale-[1.01]"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Detay
              </span>
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 group/btn relative bg-accent-yellow text-primary-blue-dark py-3 px-4 rounded-lg hover:bg-accent-yellow-light transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.01] overflow-hidden"
            >
              {/* Button Background Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-yellow-light to-accent-yellow opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isAdding ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">Ekleniyor...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="hidden sm:inline">Sepete Ekle</span>
                    <span className="sm:hidden">Ekle</span>
                  </>
                )}
              </span>
            </button>
          </div>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="w-full bg-gray-100 text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-200 transition-all font-semibold text-sm text-center"
          >
            Stokta Yok - Detayları Gör
          </Link>
        )}
      </div>
    </div>
  );
}

