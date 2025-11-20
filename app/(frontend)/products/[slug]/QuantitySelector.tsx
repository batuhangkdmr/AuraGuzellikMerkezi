'use client';

import { useState } from 'react';

interface QuantitySelectorProps {
  stock: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
}

export default function QuantitySelector({ stock, onQuantityChange, disabled = false }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (quantity < stock) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= stock) {
      setQuantity(value);
      onQuantityChange(value);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 border-2 border-gray-200">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || quantity <= 1}
        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border-2 border-gray-300 hover:border-primary-blue hover:bg-primary-blue hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
      >
        −
      </button>
      <input
        type="number"
        min="1"
        max={stock}
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-16 text-center text-lg font-bold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 disabled:opacity-50"
      />
      <span className="text-sm font-semibold text-gray-600">ADET</span>
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || quantity >= stock}
        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border-2 border-gray-300 hover:border-primary-blue hover:bg-primary-blue hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
      >
        +
      </button>
    </div>
  );
}

