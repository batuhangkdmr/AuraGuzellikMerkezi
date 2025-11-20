'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  description?: string;
  brand?: string;
  sku?: string;
  categoryPath?: string;
}

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
  canAddMore: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('compareItems');
    if (stored) {
      try {
        setCompareItems(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading compare items from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever compareItems changes
  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product: Product): boolean => {
    // Check if already in compare
    if (compareItems.some(item => item.id === product.id)) {
      return false; // Already in compare
    }

    // Check if limit reached
    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      return false; // Limit reached
    }

    setCompareItems(prev => [...prev, product]);
    return true;
  };

  const removeFromCompare = (productId: number) => {
    setCompareItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  const isInCompare = (productId: number): boolean => {
    return compareItems.some(item => item.id === productId);
  };

  const canAddMore = compareItems.length < MAX_COMPARE_ITEMS;

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddMore,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

