'use client';

import { useState, useEffect } from 'react';
import { toggleFavorite, isFavorite } from '@/app/server-actions/favoriteActions';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/app/auth/actions';
import LoginModal from './LoginModal';

interface FavoriteButtonProps {
  productId: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function FavoriteButton({ 
  productId, 
  size = 'md',
  showText = false 
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const result = await isFavorite(productId);
        if (result.success && result.data) {
          setFavorited(result.data.isFavorite);
        }
      } catch (error) {
        console.error('Error checking favorite:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkFavorite();
  }, [productId]);

  // Listen for favorite changes from other components
  useEffect(() => {
    const handleFavoriteChange = async (event: CustomEvent) => {
      if (event.detail?.productId === productId) {
        setFavorited(event.detail.isFavorite);
      } else {
        // Re-check favorite status
        try {
          const result = await isFavorite(productId);
          if (result.success && result.data) {
            setFavorited(result.data.isFavorite);
          }
        } catch (error) {
          console.error('Error checking favorite:', error);
        }
      }
    };

    window.addEventListener('favoriteChanged', handleFavoriteChange as EventListener);
    return () => window.removeEventListener('favoriteChanged', handleFavoriteChange as EventListener);
  }, [productId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    // Check if user is logged in
    try {
      const user = await getCurrentUser();
      if (!user) {
        // Show login modal instead of redirecting
        setShowLoginModal(true);
        return;
      }
    } catch {
      // Show login modal instead of redirecting
      setShowLoginModal(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await toggleFavorite(productId);
      if (result.success && result.data) {
        setFavorited(result.data.isFavorite);
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('favoriteChanged', { detail: { productId, isFavorite: result.data.isFavorite } }));
        // Refresh the page if we're on favorites page
        if (window.location.pathname === '/favorites') {
          router.refresh();
        }
      } else {
        const errorMsg = result.error || 'Favori durumu değiştirilemedi';
        console.error('Toggle favorite error:', errorMsg);
        setErrorMessage(errorMsg);
        // Clear error message after 5 seconds
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <button
        type="button"
        className={`${size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'} flex items-center justify-center text-gray-400`}
        disabled
      >
        <svg className="w-full h-full animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    );
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          className={`${sizeClasses[size]} flex items-center justify-center transition-colors ${
            favorited 
              ? 'text-pink-600 hover:text-pink-700' 
              : 'text-gray-400 hover:text-pink-600'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <svg
            className="w-full h-full"
            fill={favorited ? 'currentColor' : 'none'}
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
          {showText && (
            <span className="ml-2 text-sm">
              {favorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            </span>
          )}
        </button>
        
        {/* Error Message Toast */}
        {errorMessage && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-red-600 text-white text-xs px-3 py-2 rounded-md shadow-lg whitespace-nowrap">
            {errorMessage}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rotate-45"></div>
          </div>
        )}
      </div>

      {/* Login Modal - High z-index to prevent link clicks */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          redirectTo={typeof window !== 'undefined' ? window.location.pathname : undefined}
        />
      )}
    </>
  );
}

