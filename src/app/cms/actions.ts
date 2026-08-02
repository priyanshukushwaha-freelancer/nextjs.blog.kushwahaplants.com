'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PublishStatus } from '@prisma/client';

// Convert plain text into a structured Tiptap JSON document structure
function textToTiptapJson(text: string) {
  const paragraphs = text.split('\n').filter((p) => p.trim() !== '');
  return {
    type: 'doc',
    content: paragraphs.map((p) => ({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: p,
        },
      ],
    })),
  };
}

export async function createPostAction(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const rawContent = formData.get('content') as string;
  const status = formData.get('status') as PublishStatus;
  const seoTitle = formData.get('seoTitle') as string;
  const seoDesc = formData.get('seoDesc') as string;
  const selectedPlants = formData.getAll('plants') as string[]; // plant IDs

  if (!title || !slug || !excerpt || !rawContent) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    const slugExists = await prisma.post.findUnique({ where: { slug } });
    if (slugExists) {
      return { error: 'A publication with this slug already exists.' };
    }

    const post = await prisma.$transaction(async (tx) => {
      // 1. Create the Post
      const newPost = await tx.post.create({
        data: {
          title,
          slug: slug.toLowerCase().trim(),
          excerpt,
          content: textToTiptapJson(rawContent),
          status,
          seoTitle: seoTitle || title,
          seoDesc: seoDesc || excerpt,
          authorId: userId,
        },
      });

      // 2. Connect related plants
      if (selectedPlants.length > 0) {
        await tx.postToPlant.createMany({
          data: selectedPlants.map((plantId) => ({
            postId: newPost.id,
            plantId,
          })),
        });
      }

      // 3. Log the audit activity
      await tx.auditLog.create({
        data: {
          userId: userId,
          action: 'CREATE_POST',
          targetId: newPost.id,
          details: `Created post: "${title}" in status ${status}`,
        },
      });

      return newPost;
    });

  } catch (error: any) {
    console.error('Error creating post:', error);
    return { error: error.message || 'Failed to create post. Database error.' };
  }

  redirect('/cms');
}

export async function createPlantAction(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  const englishName = formData.get('englishName') as string;
  const scientificName = formData.get('scientificName') as string;
  const sanskritName = formData.get('sanskritName') as string;
  const hindiName = formData.get('hindiName') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const familyId = formData.get('familyId') as string;
  const conservation = formData.get('conservation') as string;

  // Ayurvedic Properties (Rasa, Guna, Virya, Vipaka, Dosha)
  const rasa = (formData.get('rasa') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];
  const guna = (formData.get('guna') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];
  const virya = (formData.get('virya') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];
  const vipaka = (formData.get('vipaka') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];
  const dosha = (formData.get('dosha') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];

  // Related IDs
  const parts = formData.getAll('parts') as string[];
  const diseases = formData.getAll('diseases') as string[];
  const actions = formData.getAll('actions') as string[];

  if (!englishName || !scientificName || !slug || !description || !familyId) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    const slugExists = await prisma.plant.findUnique({ where: { slug } });
    if (slugExists) {
      return { error: 'A plant profile with this slug already exists.' };
    }

    const scientificExists = await prisma.plant.findUnique({ where: { scientificName } });
    if (scientificExists) {
      return { error: 'A plant with this scientific name already exists.' };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Create the Plant Node
      const plant = await tx.plant.create({
        data: {
          englishName,
          scientificName,
          sanskritName: sanskritName || null,
          hindiName: hindiName || null,
          slug: slug.toLowerCase().trim(),
          description,
          familyId,
          conservation: conservation || null,
          ayurvedicProps: {
            rasa,
            guna,
            virya,
            vipaka,
            dosha,
          },
        },
      });

      // 2. Connect parts
      if (parts.length > 0) {
        await tx.plantPartToPlant.createMany({
          data: parts.map((partId) => ({
            plantId: plant.id,
            plantPartId: partId,
          })),
        });
      }

      // 3. Connect indications
      if (diseases.length > 0) {
        await tx.diseaseToPlant.createMany({
          data: diseases.map((diseaseId) => ({
            plantId: plant.id,
            diseaseId,
          })),
        });
      }

      // 4. Connect pharmacological actions
      if (actions.length > 0) {
        await tx.actionToPlant.createMany({
          data: actions.map((actionId) => ({
            plantId: plant.id,
            medicinalActionId: actionId,
          })),
        });
      }

      // 5. Log activity
      await tx.auditLog.create({
        data: {
          userId: userId,
          action: 'CREATE_PLANT',
          targetId: plant.id,
          details: `Created plant profile: "${englishName}" (${scientificName})`,
        },
      });
    });

  } catch (error: any) {
    console.error('Error creating plant:', error);
    return { error: error.message || 'Failed to create plant profile.' };
  }

  redirect('/cms');
}
