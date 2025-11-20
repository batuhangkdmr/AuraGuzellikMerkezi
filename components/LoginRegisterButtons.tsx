'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface LoginRegisterButtonsProps {
  variant?: 'mobile' | 'desktop';
}

export default function LoginRegisterButtons({ variant = 'desktop' }: LoginRegisterButtonsProps) {
  const router = useRouter();

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/auth/login');
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/auth/register');
  };

  if (variant === 'mobile') {
    return (
      <Link
        href="/auth/login"
        className="text-sm text-white hover:text-accent-yellow transition font-bold px-3 py-1.5 rounded-lg hover:bg-primary-blue-dark relative z-10"
        onClick={handleLoginClick}
      >
        Giriş
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/auth/login"
        className="text-white hover:text-accent-yellow transition font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary-blue-dark relative z-10"
        onClick={handleLoginClick}
      >
        Giriş Yap
      </Link>
      <Link
        href="/auth/register"
        className="bg-accent-yellow text-primary-blue-dark px-5 py-2 rounded-lg hover:bg-accent-yellow-light transition text-sm font-bold shadow-md hover:shadow-lg relative z-10"
        onClick={handleRegisterClick}
      >
        Kayıt Ol
      </Link>
    </div>
  );
}

