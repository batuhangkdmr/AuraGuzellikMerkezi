import { requireUser } from '@/lib/requireUser';
import Link from 'next/link';
import CreateUserForm from './CreateUserForm';

export default async function CreateUserPage() {
  await requireUser('ADMIN');

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="text-primary-blue hover:text-primary-blue-dark mb-4 inline-flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kullanıcı Yönetimine Dön
        </Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Yeni Kullanıcı Oluştur</h1>
        <p className="text-gray-600">Yeni bir kullanıcı hesabı oluşturun</p>
      </div>

      {/* Create User Form */}
      <CreateUserForm />
    </div>
  );
}

