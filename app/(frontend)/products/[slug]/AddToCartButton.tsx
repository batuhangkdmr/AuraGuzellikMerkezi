'use client';

import { useState } from 'react';
import { useCart } from '@/app/context/CartContext';

interface AddToCartButtonProps {
  productId: number;
  stock: number;
}

export default function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    if (stock === 0) {
      setMessage('Bu ürün stokta yok');
      return;
    }

    if (quantity < 1 || quantity > stock) {
      setMessage(`Miktar 1-${stock} arasında olmalıdır`);
      return;
    }

    try {
      setIsAdding(true);
      setMessage(null);
      await addItem(productId, quantity);
      setMessage('Ürün sepete eklendi!');
      setQuantity(1);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sepete eklenirken bir hata oluştu');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-gray-700 font-medium">
          Miktar:
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          max={stock}
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1 && val <= stock) {
              setQuantity(val);
            }
          }}
          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          disabled={stock === 0 || isAdding}
        />
      </div>

      <button
        onClick={handleAddToCart}
        disabled={stock === 0 || isAdding}
        className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
          stock === 0 || isAdding
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-pink-600 hover:bg-pink-700 text-white'
        }`}
      >
        {isAdding ? 'Ekleniyor...' : stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
      </button>

      {message && (
        <p
          className={`text-sm ${
            message.includes('eklendi') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

