import { requireUser } from '@/lib/requireUser';
import { getAllReviews } from '@/app/server-actions/reviewActions';
import { formatDateToTurkey } from '@/lib/utils/dateFormatter';
import ReviewList from './ReviewList';

export default async function AdminReviewsPage() {
  await requireUser('ADMIN');

  const reviewsResult = await getAllReviews(1, 50);
  const reviewsData = reviewsResult.success && reviewsResult.data ? reviewsResult.data : { reviews: [], total: 0, page: 1, limit: 50 };

  // Calculate statistics
  const totalReviews = reviewsData.total;
  const approvedReviews = reviewsData.reviews.filter(r => r.isApproved).length;
  const pendingReviews = reviewsData.reviews.filter(r => !r.isApproved).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Ürün Yorumları</h1>
        <p className="text-gray-600">Ürün yorumlarını görüntüleyin ve yönetin</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-primary-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Toplam Yorum</p>
              <p className="text-3xl font-extrabold text-gray-900">{totalReviews}</p>
            </div>
            <div className="bg-primary-blue/10 rounded-lg p-3">
              <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Onaylanan</p>
              <p className="text-3xl font-extrabold text-green-600">{approvedReviews}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Onay Bekleyen</p>
              <p className="text-3xl font-extrabold text-yellow-600">{pendingReviews}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <ReviewList initialReviews={reviewsData.reviews} />
    </div>
  );
}

