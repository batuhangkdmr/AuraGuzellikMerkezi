'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser } from '@/app/server-actions/userActions';
import { showToast } from '@/components/ToastContainer';
import { UserRole } from '@/lib/types/UserRole';
import Link from 'next/link';

export default function CreateUserForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.USER,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value.toString());
      });

      const result = await createUser(formDataObj);

      if (result.success) {
        showToast('Kullanıcı başarıyla oluşturuldu', 'success');
        router.push('/admin/users');
        router.refresh();
      } else {
        showToast(result.error || 'Bir hata oluştu', 'error');
      }
    } catch (error) {
      showToast('Bir hata oluştu', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 lg:p-8 border-2 border-gray-200 max-w-2xl">
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Ad Soyad *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            E-posta *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
            Şifre *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">Şifre en az 6 karakter olmalıdır</p>
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
            Rol *
          </label>
          <select
            id="role"
            name="role"
            required
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all"
          >
            <option value={UserRole.USER}>Kullanıcı</option>
            <option value={UserRole.ADMIN}>Yönetici</option>
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-accent-yellow text-primary-blue-dark rounded-lg hover:bg-accent-yellow-light transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Oluşturuluyor...' : 'Kullanıcı Oluştur'}
          </button>
          <Link
            href="/admin/users"
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-bold text-center"
          >
            İptal
          </Link>
        </div>
      </div>
    </form>
  );
}

