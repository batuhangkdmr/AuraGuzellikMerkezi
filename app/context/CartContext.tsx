'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { addToCart, removeFromCart, updateCartItemQuantity, getCartItems, clearCart } from '../server-actions/cartActions';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cart_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from server
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getCartItems();
      if (result.success && result.data) {
        setItems(result.data);
        // Also save to localStorage for quick access
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(result.data));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cart on mount
  useEffect(() => {
    // Try to load from localStorage first for instant display
    const cached = localStorage.getItem(CART_STORAGE_KEY);
    if (cached) {
      try {
        setItems(JSON.parse(cached));
      } catch {
        // Ignore parse errors
      }
    }

    // Then refresh from server
    refresh();
  }, [refresh]);

  // Add item to cart
  const addItem = useCallback(async (productId: number, quantity: number = 1) => {
    const result = await addToCart(productId, quantity);
    if (result.success) {
      await refresh();
    } else {
      throw new Error(result.error || 'Failed to add item to cart');
    }
  }, [refresh]);

  // Remove item from cart
  const removeItem = useCallback(async (cartItemId: number) => {
    const result = await removeFromCart(cartItemId);
    if (result.success) {
      await refresh();
    } else {
      throw new Error(result.error || 'Failed to remove item from cart');
    }
  }, [refresh]);

  // Update item quantity
  const updateQuantity = useCallback(
    async (cartItemId: number, quantity: number) => {
      if (quantity < 1) {
        await removeItem(cartItemId);
        return;
      }

      // Optimistic update to avoid full re-render
      setItems(prev => {
        const updated = prev.map(item =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      const result = await updateCartItemQuantity(cartItemId, quantity);
      if (!result.success) {
        // Revert via refresh if server validation failed
        await refresh();
        throw new Error(result.error || 'Failed to update item quantity');
      }
    },
    [refresh, removeItem]
  );

  // Clear cart
  const clear = useCallback(async () => {
    const result = await clearCart();
    if (result.success) {
      setItems([]);
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      throw new Error(result.error || 'Failed to clear cart');
    }
  }, []);

  // Calculate total
  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  // Get item count
  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        refresh,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

