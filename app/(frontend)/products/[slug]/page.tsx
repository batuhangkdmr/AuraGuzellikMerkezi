import { getProductBySlug } from '@/app/server-actions/productActions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from './AddToCartButton';

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
  const mainImage = images[0] || 'https://via.placeholder.com/800x600?text=No+Image';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="relative h-96 w-full">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-pink-600">
                  {product.price.toFixed(2)} ₺
                </span>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-6">
                {product.stock > 0 ? (
                  <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full">
                    Stokta var ({product.stock} adet)
                  </span>
                ) : (
                  <span className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-full">
                    Stokta yok
                  </span>
                )}
              </div>

              {/* Add to Cart */}
              <AddToCartButton productId={product.id} stock={product.stock} />
            </div>
          </div>

          {/* Additional Images */}
          {images.length > 1 && (
            <div className="px-8 pb-8">
              <h2 className="text-xl font-semibold mb-4">Diğer Görseller</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.slice(1).map((image, index) => (
                  <div key={index} className="relative h-32 w-full">
                    <Image
                      src={image}
                      alt={`${product.name} - Görsel ${index + 2}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

