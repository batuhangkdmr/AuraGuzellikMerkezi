'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Aradığınız ürün, kategori veya markayı yazınız"
          className="w-full px-5 py-3.5 pr-14 bg-white rounded-xl border-2 border-accent-yellow/30 focus:outline-none focus:ring-2 focus:ring-accent-yellow focus:border-accent-yellow text-sm text-gray-900 placeholder-gray-500 shadow-lg transition-all group-hover:border-accent-yellow/50"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent-yellow text-primary-blue-dark p-2.5 rounded-lg hover:bg-accent-yellow-light transition-all shadow-lg hover:shadow-xl transform hover:scale-110"
          aria-label="Ara"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

