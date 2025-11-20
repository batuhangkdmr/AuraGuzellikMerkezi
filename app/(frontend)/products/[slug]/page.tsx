import { getProductBySlug } from '@/app/server-actions/productActions';
import { getProductRating } from '@/app/server-actions/reviewActions';
import { notFound } from 'next/navigation';
import ProductImageGallery from './ProductImageGallery';
import ProductDetailInfo from './ProductDetailInfo';
import ProductReviews from './ProductReviews';

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const result = await getProductBySlug(params.slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data;
  const images = product.images || [];

  // Get product rating
  const ratingResult = await getProductRating(product.id);
  const rating = ratingResult.success && ratingResult.data ? ratingResult.data : { average: 0, count: 0 };

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-10">
            {/* Left Side - Product Images */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <ProductImageGallery images={images} productName={product.name} />
            </div>

            {/* Right Side - Product Information */}
            <div>
              <ProductDetailInfo product={product} rating={rating} />
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="mt-8">
          <ProductReviews productId={product.id} productSlug={product.slug} />
        </div>
      </div>
    </div>
  );
}

