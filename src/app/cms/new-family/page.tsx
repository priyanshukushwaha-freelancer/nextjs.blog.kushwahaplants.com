import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import NewFamilyForm from '@/components/cms/NewFamilyForm';

export const dynamic = 'force-dynamic';

export default async function NewFamilyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10">
      <NewFamilyForm />
    </div>
  );
}
