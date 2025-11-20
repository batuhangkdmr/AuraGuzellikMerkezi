'use client';

import { useState, useEffect } from 'react';
import { getProductReviews, createReview, updateReview, deleteReview } from '@/app/server-actions/reviewActions';
import { showToast } from '@/components/ToastContainer';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';

interface ProductReviewsProps {
  productId: number;
  productSlug: string;
}

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export default function ProductReviews({ productId, productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setIsLoading(true);
    const result = await getProductReviews(productId);
    if (result.success && result.data) {
      setReviews(result.data);
      // Check if user has already reviewed (simplified - in real app, check user ID)
      // For now, we'll just show the form if no reviews exist
    }
    setIsLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('productId', productId.toString());
    formData.append('rating', rating.toString());
    formData.append('comment', comment);

    const result = userReview
      ? await updateReview(userReview.id, formData)
      : await createReview(formData);

    if (result.success) {
      showToast(userReview ? 'Yorumunuz güncellendi' : 'Yorumunuz gönderildi. Onay bekleniyor.', 'success');
      setShowReviewForm(false);
      setComment('');
      setRating(5);
      loadReviews();
    } else {
      showToast(result.error || 'Yorum gönderilirken bir hata oluştu', 'error');
    }
    setIsSubmitting(false);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Yorumunuzu silmek istediğinize emin misiniz?')) {
      return;
    }

    const result = await deleteReview(reviewId);
    if (result.success) {
      showToast('Yorumunuz silindi', 'success');
      loadReviews();
    } else {
      showToast(result.error || 'Yorum silinirken bir hata oluştu', 'error');
    }
  };

  return (
    <div className="mt-12 bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900">Ürün Yorumları</h2>
        {!showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-semibold"
          >
            Yorum Yap
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {userReview ? 'Yorumunuzu Düzenle' : 'Yorumunuzu Yazın'}
          </h3>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Değerlendirme</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 rounded-lg transition-all ${
                    star <= rating
                      ? 'bg-accent-yellow text-primary-blue-dark'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
              Yorumunuz (Opsiyonel)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
              placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 karakter</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold disabled:opacity-50"
            >
              {isSubmitting ? 'Gönderiliyor...' : userReview ? 'Güncelle' : 'Gönder'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(false);
                setComment('');
                setRating(5);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Yorumlar yükleniyor...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-600 text-lg mb-2">Henüz yorum yapılmamış</p>
          <p className="text-gray-500 text-sm">İlk yorumu siz yapın!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-blue rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex text-accent-yellow">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateToTurkey(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 leading-relaxed ml-13">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

