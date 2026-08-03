import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import NewDiseaseForm from '@/components/cms/NewDiseaseForm';

export const dynamic = 'force-dynamic';

export default async function NewDiseasePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10">
      <NewDiseaseForm />
    </div>
  );
}
