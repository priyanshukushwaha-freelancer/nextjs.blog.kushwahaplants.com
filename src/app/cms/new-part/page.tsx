import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import NewPartForm from '@/components/cms/NewPartForm';

export const dynamic = 'force-dynamic';

export default async function NewPartPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10">
      <NewPartForm />
    </div>
  );
}
