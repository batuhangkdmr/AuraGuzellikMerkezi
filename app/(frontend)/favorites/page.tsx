import { getFavorites } from '@/app/server-actions/favoriteActions';
import { requireUser } from '@/lib/requireUser';
import { redirect } from 'next/navigation';
import FavoritesClient from './FavoritesClient';

export default async function FavoritesPage() {
  try {
    await requireUser('USER');
  } catch (error) {
    console.error('Auth error in favorites page:', error);
    redirect('/auth/login');
  }

  try {
    const result = await getFavorites();

    if (!result.success || !result.data) {
      console.error('Get favorites failed:', result.error);
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Favorilerim</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-2">Favoriler yüklenirken bir hata oluştu</p>
              {result.error && (
                <p className="text-red-600 text-sm">{result.error}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    const favorites = result.data;

    return <FavoritesClient initialFavorites={favorites} />;
  } catch (error: any) {
    console.error('Unexpected error in favorites page:', error);
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Favorilerim</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Beklenmeyen bir hata oluştu</p>
            <p className="text-red-600 text-sm">
              {error?.message || 'Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

