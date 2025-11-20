'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import FavoriteButton from '@/components/FavoriteButton';
import QuantitySelector from './QuantitySelector';
import { showToast } from '@/components/ToastContainer';

interface ProductDetailInfoProps {
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
    description?: string;
    brand?: string;
    sku?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
}

export default function ProductDetailInfo({ product, rating }: ProductDetailInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      showToast('Bu ürün stokta yok', 'error');
      return;
    }

    if (quantity < 1 || quantity > product.stock) {
      showToast(`Miktar 1-${product.stock} arasında olmalıdır`, 'error');
      return;
    }

    try {
      setIsAdding(true);
      await addItem(product.id, quantity);
      showToast(`${product.name} sepete eklendi!`, 'success');
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Sepete eklenirken bir hata oluştu', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // Calculate delivery date (15 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 15);
  const deliveryDateStr = deliveryDate.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
          {product.name}
        </h1>
        
        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <div className="flex text-accent-yellow">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-5 h-5 ${i < Math.round(rating?.average || 0) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900 ml-1">
              {rating?.average ? rating.average.toFixed(1) : '0.0'}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {rating?.count || 0} {rating?.count === 1 ? 'Değerlendirme' : 'Değerlendirme'}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="pb-4 border-b-2 border-gray-200">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-gray-600">KDV Dahil fiyatı:</span>
          <span className="text-3xl md:text-4xl font-extrabold text-primary-blue">
            {product.price.toFixed(2).replace('.', ',')} TL
          </span>
        </div>
      </div>

      {/* Quantity Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Miktar</label>
        <QuantitySelector
          stock={product.stock}
          onQuantityChange={handleQuantityChange}
          disabled={product.stock === 0 || isAdding}
        />
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0 || isAdding}
        className="w-full bg-primary-blue text-white py-4 px-6 rounded-lg hover:bg-primary-blue-dark transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isAdding ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Ekleniyor...
          </span>
        ) : (
          'SEPETE EKLE'
        )}
      </button>

      {/* Product Specifications */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-3">
        <h3 className="text-lg font-extrabold text-gray-900 mb-4">Ürün Özellikleri</h3>
        
        {product.sku && (
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-semibold text-gray-600">Barkodu:</span>
            <span className="text-sm font-bold text-gray-900">{product.sku}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-600">Stok Miktarı:</span>
          <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? 'Stokta Var' : 'Stokta Yok'}
          </span>
        </div>
        
        {product.brand && (
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-gray-600">Markası:</span>
            <span className="text-sm font-bold text-gray-900">{product.brand}</span>
          </div>
        )}
      </div>

      {/* Delivery Information */}
      <div className="bg-accent-yellow/10 rounded-xl p-5 border-2 border-accent-yellow/30">
        <h3 className="text-lg font-extrabold text-gray-900 mb-3">Teslimat Bilgileri</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">TÜM TÜRKİYE</span>
          </div>
          <p className="text-sm text-gray-600">
            En geç <span className="font-bold text-primary-blue">{deliveryDateStr}</span> günü kargoda
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-accent-yellow hover:bg-accent-yellow/10 transition-all font-semibold text-gray-700">
          <FavoriteButton productId={product.id} size="md" />
          <span>Favorilerime Ekle</span>
        </button>
        
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-blue hover:bg-primary-blue/10 transition-all font-semibold text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Arkadaşıma Öner</span>
        </button>
      </div>

      {/* Social Media Share */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-600 mb-3">Paylaş:</p>
        <div className="flex items-center gap-3">
          <a
            href={currentUrl ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            title="Facebook'ta Paylaş"
          >
            <span className="font-bold text-sm">f</span>
          </a>
          <a
            href={currentUrl ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
            title="X'te Paylaş"
          >
            <span className="font-bold text-sm">X</span>
          </a>
          <a
            href={currentUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all"
            title="LinkedIn'de Paylaş"
          >
            <span className="font-bold text-xs">in</span>
          </a>
          <a
            href={currentUrl ? `https://wa.me/?text=${encodeURIComponent(currentUrl)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
            title="WhatsApp'ta Paylaş"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="pt-6 border-t-2 border-gray-200">
          <h3 className="text-xl font-extrabold text-gray-900 mb-4">Ürün Açıklaması</h3>
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p>{product.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

