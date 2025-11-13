import { getAllAttributes } from '@/app/server-actions/attributeActions';
import Link from 'next/link';
import DeleteAttributeButton from './DeleteAttributeButton';
import ToggleAttributeActiveButton from './ToggleAttributeActiveButton';

export default async function AdminAttributesPage() {
  try {
    const result = await getAllAttributes(true);
    const attributes = result.success && result.data ? result.data : [];

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Ürün Özellikleri Yönetimi</h1>
            <Link
              href="/admin/attributes/new"
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Yeni Özellik Ekle
            </Link>
          </div>

          {attributes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">Henüz özellik bulunmamaktadır.</p>
              <Link
                href="/admin/attributes/new"
                className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                İlk Özelliği Ekle
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Özellik Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attributes.map((attribute) => (
                    <tr key={attribute.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{attribute.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{attribute.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {attribute.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {attribute.displayOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ToggleAttributeActiveButton
                          id={attribute.id}
                          isActive={attribute.isActive}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/attributes/${attribute.id}/edit`}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          Düzenle
                        </Link>
                        <DeleteAttributeButton id={attribute.id} name={attribute.name} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Admin attributes page error:', error);
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Hata</h2>
            <p className="text-red-600">Özellikler yüklenirken bir hata oluştu.</p>
          </div>
        </div>
      </div>
    );
  }
}

