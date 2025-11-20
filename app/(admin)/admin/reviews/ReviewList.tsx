'use client';

import { useState } from 'react';
import { updateReviewApproval, deleteReview } from '@/app/server-actions/reviewActions';
import { showToast } from '@/components/ToastContainer';
import Link from 'next/link';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';

interface Review {
  id: number;
  productId: number;
  productName: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
}

interface ReviewListProps {
  initialReviews: Review[];
}

export default function ReviewList({ initialReviews }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleToggleApproval = async (review: Review) => {
    setUpdatingId(review.id);
    const result = await updateReviewApproval(review.id, !review.isApproved);
    
    if (result.success) {
      setReviews(reviews.map(r => 
        r.id === review.id ? { ...r, isApproved: !r.isApproved } : r
      ));
      showToast(review.isApproved ? 'Yorum reddedildi' : 'Yorum onaylandı', 'success');
    } else {
      showToast(result.error || 'Yorum güncellenirken bir hata oluştu', 'error');
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
      return;
    }

    setDeletingId(id);
    const result = await deleteReview(id);
    
    if (result.success) {
      setReviews(reviews.filter(r => r.id !== id));
      showToast('Yorum başarıyla silindi', 'success');
    } else {
      showToast(result.error || 'Yorum silinirken bir hata oluştu', 'error');
    }
    setDeletingId(null);
  };

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-gray-200">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-600 text-lg font-semibold">Henüz yorum bulunmamaktadır</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Ürün</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Kullanıcı</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Puan</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Yorum</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/products/${review.productId}`}
                    className="font-semibold text-primary-blue hover:text-primary-blue-dark"
                  >
                    {review.productName}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/users/${review.userId}`}
                    className="text-sm text-gray-700 hover:text-primary-blue"
                  >
                    {review.userName}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-accent-yellow' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm font-semibold text-gray-700">{review.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 max-w-md truncate">{review.comment}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border-2 ${
                    review.isApproved
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                  }`}>
                    {review.isApproved ? 'Onaylandı' : 'Beklemede'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {formatDateToTurkey(review.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleApproval(review)}
                      disabled={updatingId === review.id}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                        review.isApproved
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      } disabled:opacity-50`}
                    >
                      {updatingId === review.id ? '...' : review.isApproved ? 'Reddet' : 'Onayla'}
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-xs disabled:opacity-50"
                    >
                      {deletingId === review.id ? '...' : 'Sil'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

