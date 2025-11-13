'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateAttribute, createAttributeValue, updateAttributeValue, deleteAttributeValue } from '@/app/server-actions/attributeActions';
import { generateSlug } from '@/lib/utils/slug';
import { AttributeWithValues } from '@/lib/repositories/AttributeRepository';

interface EditAttributeFormProps {
  attribute: AttributeWithValues;
}

export default function EditAttributeForm({ attribute: initialAttribute }: EditAttributeFormProps) {
  const router = useRouter();
  const [attribute, setAttribute] = useState(initialAttribute);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState(attribute.slug);
  const [isSlugManual, setIsSlugManual] = useState(true);

  // Value management
  const [newValue, setNewValue] = useState({ value: '', slug: '', colorCode: '', displayOrder: 0 });
  const [editingValueId, setEditingValueId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState({ value: '', slug: '', colorCode: '', displayOrder: 0 });

  const handleAttributeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateAttribute(attribute.id, formData);

      if (result.success && result.data) {
        setAttribute({ ...attribute, ...result.data });
        router.refresh();
      } else {
        setError(result.error || 'Özellik güncellenirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Özellik güncellenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newValue.value.trim()) {
      setError('Değer adı gereklidir');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('attributeId', attribute.id.toString());
      formData.append('value', newValue.value);
      formData.append('slug', newValue.slug || generateSlug(newValue.value));
      if (newValue.colorCode) formData.append('colorCode', newValue.colorCode);
      formData.append('displayOrder', newValue.displayOrder.toString());
      formData.append('isActive', 'true');

      const result = await createAttributeValue(formData);

      if (result.success && result.data) {
        setAttribute({
          ...attribute,
          values: [...attribute.values, result.data],
        });
        setNewValue({ value: '', slug: '', colorCode: '', displayOrder: 0 });
        router.refresh();
      } else {
        setError(result.error || 'Değer eklenirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Değer eklenirken bir hata oluştu');
    }
  };

  const handleEditValue = (value: typeof attribute.values[0]) => {
    setEditingValueId(value.id);
    setEditingValue({
      value: value.value,
      slug: value.slug,
      colorCode: value.colorCode || '',
      displayOrder: value.displayOrder,
    });
  };

  const handleUpdateValue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingValueId) return;

    setError(null);

    try {
      const formData = new FormData();
      formData.append('value', editingValue.value);
      formData.append('slug', editingValue.slug);
      if (editingValue.colorCode) formData.append('colorCode', editingValue.colorCode);
      formData.append('displayOrder', editingValue.displayOrder.toString());

      const result = await updateAttributeValue(editingValueId, formData);

      if (result.success && result.data) {
        setAttribute({
          ...attribute,
          values: attribute.values.map(v => v.id === editingValueId ? result.data! : v),
        });
        setEditingValueId(null);
        setEditingValue({ value: '', slug: '', colorCode: '', displayOrder: 0 });
        router.refresh();
      } else {
        setError(result.error || 'Değer güncellenirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Değer güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteValue = async (id: number) => {
    if (!confirm('Bu değeri silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const result = await deleteAttributeValue(id);
      if (result.success) {
        setAttribute({
          ...attribute,
          values: attribute.values.filter(v => v.id !== id),
        });
        router.refresh();
      } else {
        setError(result.error || 'Değer silinirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Değer silinirken bir hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Attribute Form */}
      <form onSubmit={handleAttributeSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Özellik Adı *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={attribute.name}
            required
            onChange={(e) => {
              if (!isSlugManual) {
                const autoSlug = generateSlug(e.target.value);
                setSlug(autoSlug);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-gray-700 font-medium mb-2">
            Slug (URL) *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={slug}
            required
            onChange={(e) => {
              setSlug(e.target.value);
              setIsSlugManual(true);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
            pattern="^[a-z0-9-]+$"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
            Özellik Tipi *
          </label>
          <select
            id="type"
            name="type"
            defaultValue={attribute.type}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
          >
            <option value="text">Metin (Text)</option>
            <option value="color">Renk (Color)</option>
            <option value="number">Sayı (Number)</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>

        <div>
          <label htmlFor="displayOrder" className="block text-gray-700 font-medium mb-2">
            Görüntüleme Sırası
          </label>
          <input
            type="number"
            id="displayOrder"
            name="displayOrder"
            defaultValue={attribute.displayOrder}
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-gray-900"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={attribute.isActive}
              className="w-4 h-4 text-pink-600 focus:ring-pink-500 rounded"
            />
            <span className="text-gray-700">Aktif</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Güncelleniyor...' : 'Özellik Güncelle'}
          </button>
        </div>
      </form>

      {/* Values Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Özellik Değerleri</h2>
        <p className="text-sm text-gray-600 mb-6">
          Bu özellik için değerler ekleyin. Bu değerler filtreleme sayfasında "{attribute.name} Ara" başlığı altında checkbox'lar olarak görünecektir.
        </p>

        {/* Add New Value Form */}
        <form onSubmit={handleAddValue} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Yeni Değer Ekle</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Değer Adı *</label>
              <input
                type="text"
                value={newValue.value}
                onChange={(e) => {
                  setNewValue({
                    ...newValue,
                    value: e.target.value,
                    slug: newValue.slug || generateSlug(e.target.value),
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                placeholder="Örn: XS, S, M, L"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={newValue.slug}
                onChange={(e) => setNewValue({ ...newValue, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                placeholder="xs"
              />
            </div>
            {attribute.type === 'color' && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Renk Kodu</label>
                <input
                  type="color"
                  value={newValue.colorCode || '#000000'}
                  onChange={(e) => setNewValue({ ...newValue, colorCode: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Sıra</label>
              <input
                type="number"
                value={newValue.displayOrder}
                onChange={(e) => setNewValue({ ...newValue, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                min="0"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-sm"
          >
            Değer Ekle
          </button>
        </form>

        {/* Values List */}
        <div className="space-y-2">
          {attribute.values.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz değer eklenmemiş.</p>
          ) : (
            attribute.values.map((value) => (
              <div key={value.id} className="border border-gray-200 rounded-lg p-4">
                {editingValueId === value.id ? (
                  <form onSubmit={handleUpdateValue} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Değer Adı</label>
                        <input
                          type="text"
                          value={editingValue.value}
                          onChange={(e) => setEditingValue({ ...editingValue, value: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Slug</label>
                        <input
                          type="text"
                          value={editingValue.slug}
                          onChange={(e) => setEditingValue({ ...editingValue, slug: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                          required
                        />
                      </div>
                      {attribute.type === 'color' && (
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Renk Kodu</label>
                          <input
                            type="color"
                            value={editingValue.colorCode || '#000000'}
                            onChange={(e) => setEditingValue({ ...editingValue, colorCode: e.target.value })}
                            className="w-full h-10 border border-gray-300 rounded-md text-gray-900"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Sıra</label>
                        <input
                          type="number"
                          value={editingValue.displayOrder}
                          onChange={(e) => setEditingValue({ ...editingValue, displayOrder: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Kaydet
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingValueId(null);
                          setEditingValue({ value: '', slug: '', colorCode: '', displayOrder: 0 });
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {attribute.type === 'color' && value.colorCode && (
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: value.colorCode }}
                        />
                      )}
                      <div>
                        <span className="font-medium text-gray-900">{value.value}</span>
                        <span className="text-sm text-gray-500 ml-2">({value.slug})</span>
                        <span className="text-xs text-gray-400 ml-2">Sıra: {value.displayOrder}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditValue(value)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteValue(value.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

