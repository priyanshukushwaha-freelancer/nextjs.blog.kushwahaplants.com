import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import NewPlantForm from '@/components/cms/NewPlantForm';

export const dynamic = 'force-dynamic';

export default async function NewPlantPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  let families: any[] = [];
  let parts: any[] = [];
  let diseases: any[] = [];
  let actions: any[] = [];

  try {
    [families, parts, diseases, actions] = await Promise.all([
      prisma.family.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
      prisma.plantPart.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
      prisma.disease.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
      prisma.medicinalAction.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    ]);
  } catch (error) {
    console.error('Error fetching botanical taxonomic metadata:', error);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10">
      <NewPlantForm
        families={families}
        parts={parts}
        diseases={diseases}
        actions={actions}
      />
    </div>
  );
}
