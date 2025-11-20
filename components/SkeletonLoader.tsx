'use client';

interface SkeletonLoaderProps {
  type?: 'product' | 'text' | 'image' | 'button';
  className?: string;
}

export default function SkeletonLoader({ type = 'text', className = '' }: SkeletonLoaderProps) {
  if (type === 'product') {
    return (
      <div className={`bg-primary-blue rounded-lg border-2 border-accent-yellow/30 overflow-hidden animate-pulse ${className}`}>
        <div className="h-48 sm:h-56 lg:h-64 bg-primary-blue-dark"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-primary-blue-dark rounded w-3/4"></div>
          <div className="h-4 bg-primary-blue-dark rounded w-1/2"></div>
          <div className="h-6 bg-primary-blue-dark rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className={`bg-primary-blue-dark rounded animate-pulse ${className}`}></div>
    );
  }

  if (type === 'button') {
    return (
      <div className={`h-10 bg-primary-blue-dark rounded animate-pulse ${className}`}></div>
    );
  }

  return (
    <div className={`h-4 bg-primary-blue-dark rounded animate-pulse ${className}`}></div>
  );
}

export function ProductCardSkeleton() {
  return <SkeletonLoader type="product" />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

