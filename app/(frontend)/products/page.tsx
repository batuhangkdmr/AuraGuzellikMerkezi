import { getAllProducts } from '@/app/server-actions/productActions';
import Link from 'next/link';
import Image from 'next/image';

export default async function ProductsPage() {
  const result = await getAllProducts();

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Ürünler</h1>
          <p className="text-red-600">{result.error || 'Ürünler yüklenirken bir hata oluştu'}</p>
        </div>
      </div>
    );
  }

  const products = result.data;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ürünlerimiz</h1>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Henüz ürün bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const images = product.images || [];
              const mainImage = images[0] || '/placeholder-image.svg';

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-64 w-full">
                    <Image
                      src={mainImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-pink-600">
                        {product.price.toFixed(2)} ₺
                      </span>
                      {product.stock > 0 ? (
                        <span className="text-sm text-green-600">Stokta var</span>
                      ) : (
                        <span className="text-sm text-red-600">Stokta yok</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

