import { requireUser } from '@/lib/requireUser';
import { redirect } from 'next/navigation';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ayarlar</h1>
        <SettingsForm user={user} />
      </div>
    </div>
  );
}

