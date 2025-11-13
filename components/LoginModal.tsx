'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function LoginModal({ isOpen, onClose, redirectTo }: LoginModalProps) {
  const router = useRouter();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const redirectUrl = redirectTo 
      ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}`
      : '/auth/login';
    // Use window.location for full navigation to prevent event bubbling
    window.location.href = redirectUrl;
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50" 
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Giriş Yapın</h3>
        <p className="text-gray-600 mb-6">
          Bu özelliği kullanmak için giriş yapmanız gerekiyor.
        </p>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleLogin}
            className="flex-1 bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition font-medium"
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition font-medium"
          >
            İptal
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/auth/register"
            className="text-sm text-pink-600 hover:text-pink-700"
            onClick={handleClose}
          >
            Hesabınız yok mu? Kayıt olun
          </Link>
        </div>
      </div>
    </div>
  );

  // Render modal in a portal to avoid z-index issues
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

