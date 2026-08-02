import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import NewPostForm from '@/components/cms/NewPostForm';

export const dynamic = 'force-dynamic';

export default async function NewPostPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  let plants: any[] = [];
  try {
    plants = await prisma.plant.findMany({
      orderBy: { englishName: 'asc' },
      select: { id: true, englishName: true, scientificName: true },
    });
  } catch (error) {
    console.error('Error fetching plants list:', error);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-6 lg:px-8 py-10">
      <NewPostForm plants={plants} />
    </div>
  );
}
