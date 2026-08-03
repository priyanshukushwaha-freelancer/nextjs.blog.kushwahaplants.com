'use server';

import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PublishStatus } from '@prisma/client';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { checkRateLimit } from '@/lib/rate-limit';

// Convert plain text into structured Tiptap JSON blocks
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

// Magic bytes validation for safe image uploads
function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  // RIFF/WEBP: 52 49 46 46
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return true;
  return false;
}

// Process uploaded file and convert to WebP using sharp with security validation
async function saveUploadedImage(file: File, plantName: string): Promise<string | null> {
  if (!file || file.size === 0) return null;

  // Enforce 5MB limit
  const MAX_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    throw new Error('Image file size exceeds the maximum limit of 5MB.');
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic bytes security inspection
    if (!isValidImageMagicBytes(buffer)) {
      throw new Error('Invalid image file format. Only JPEG, PNG, WebP, and GIF images are allowed.');
    }
    
    // Resize and compress to WebP buffer
    const webpBuffer = await sharp(buffer)
      .resize({ width: 800, height: 600, fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();

    const safeSlug = plantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const filename = `${safeSlug}-${Date.now()}.webp`;

    // Attempt to write file to public/uploads/plants/ for CDN serving
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'plants');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, webpBuffer);
      return `/uploads/plants/${filename}`;
    } catch (fsErr) {
      // In serverless environments where local disk is read-only, fallback to WebP data URI
      console.warn('⚠️ Public uploads folder non-writable, falling back to compressed WebP data URI.');
      const base64 = webpBuffer.toString('base64');
      return `data:image/webp;base64,${base64}`;
    }
  } catch (err: any) {
    console.error('⚠️ Image processing failed:', err.message || err);
    throw err;
  }
}

// 1. Create Publication/Post Action
export async function createPostAction(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  // Rate Limiting Check
  const rateCheck = await checkRateLimit('create-post', 5, 60000);
  if (!rateCheck.success) {
    return { error: rateCheck.error };
  }

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const rawContent = formData.get('content') as string;
  const status = formData.get('status') as PublishStatus;
  const seoTitle = formData.get('seoTitle') as string;
  const seoDesc = formData.get('seoDesc') as string;
  const selectedPlants = formData.getAll('plants') as string[];

  if (!title || !slug || !excerpt || !rawContent) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    const slugExists = await prisma.post.findUnique({ where: { slug } });
    if (slugExists) {
      return { error: 'A publication with this slug already exists.' };
    }

    await prisma.$transaction(async (tx) => {
      let structuredContent: any;
      try {
        structuredContent = JSON.parse(rawContent);
      } catch {
        structuredContent = textToTiptapJson(rawContent);
      }

      const newPost = await tx.post.create({
        data: {
          title,
          slug: slug.toLowerCase().trim(),
          excerpt,
          content: structuredContent,
          status,
          seoTitle: seoTitle || title,
          seoDesc: seoDesc || excerpt,
          authorId: userId,
        },
      });

      if (selectedPlants.length > 0) {
        await tx.postToPlant.createMany({
          data: selectedPlants.map((plantId) => ({
            postId: newPost.id,
            plantId,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          userId: userId,
          action: 'CREATE_POST',
          targetId: newPost.id,
          details: `Created post: "${title}"`,
        },
      });
    });

  } catch (error: any) {
    console.error(error);
    return { error: error.message || 'Failed to create post.' };
  }

  redirect('/cms');
}

// 2. Create Plant Profile Action
export async function createPlantAction(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  // Rate Limiting Check
  const rateCheck = await checkRateLimit('create-plant', 5, 60000);
  if (!rateCheck.success) {
    return { error: rateCheck.error };
  }

  const englishName = formData.get('englishName') as string;
  const scientificName = formData.get('scientificName') as string;
  const sanskritName = formData.get('sanskritName') as string;
  const hindiName = formData.get('hindiName') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const familyId = formData.get('familyId') as string;
  const conservation = formData.get('conservation') as string;

  // YouTube Videos (parse links)
  const ytUrls = formData.getAll('youtubeUrls') as string[];
  const ytTitles = formData.getAll('youtubeTitles') as string[];
  const videosJson = ytUrls
    .map((url, i) => ({ url, title: ytTitles[i] || 'YouTube Video' }))
    .filter((v) => v.url.trim() !== '');

  // FAQs
  const faqQs = formData.getAll('faqQuestions') as string[];
  const faqAs = formData.getAll('faqAnswers') as string[];
  const faqsList = faqQs
    .map((q, i) => ({ question: q, answer: faqAs[i] || '' }))
    .filter((f) => f.question.trim() !== '' && f.answer.trim() !== '');

  // Ayurvedic Props
  const rasa = (formData.get('rasa') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];
  const guna = (formData.get('guna') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];
  const virya = (formData.get('virya') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];
  const vipaka = (formData.get('vipaka') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];
  const dosha = (formData.get('dosha') as string)?.split(',').map((x) => x.trim()).filter(Boolean) || [];

  const parts = formData.getAll('parts') as string[];
  const diseases = formData.getAll('diseases') as string[];
  const actions = formData.getAll('actions') as string[];

  // Image Upload File
  const imageFile = formData.get('imageFile') as File;

  if (!englishName || !scientificName || !slug || !description || !familyId) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    const slugExists = await prisma.plant.findUnique({ where: { slug } });
    if (slugExists) {
      return { error: 'A plant profile with this slug already exists.' };
    }

    // Process image file validation outside transaction
    let savedPath: string | null = null;
    if (imageFile && imageFile.size > 0) {
      savedPath = await saveUploadedImage(imageFile, englishName);
    }

    await prisma.$transaction(async (tx) => {
      // Create Plant
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
          ayurvedicProps: { rasa, guna, virya, vipaka, dosha },
          videos: videosJson.length > 0 ? videosJson : undefined,
        },
      });

      // Save uploaded image URL
      if (savedPath) {
        await tx.image.create({
          data: {
            url: savedPath,
            altText: `${englishName} botanical plant profile illustration`,
            width: 800,
            height: 600,
            plantId: plant.id,
          },
        });
      }

      // Connect parts, indications, actions
      if (parts.length > 0) {
        await tx.plantPartToPlant.createMany({
          data: parts.map((partId) => ({ plantId: plant.id, plantPartId: partId })),
        });
      }
      if (diseases.length > 0) {
        await tx.diseaseToPlant.createMany({
          data: diseases.map((diseaseId) => ({ plantId: plant.id, diseaseId })),
        });
      }
      if (actions.length > 0) {
        await tx.actionToPlant.createMany({
          data: actions.map((actionId) => ({ plantId: plant.id, medicinalActionId: actionId })),
        });
      }

      // Save FAQs
      if (faqsList.length > 0) {
        await tx.faq.createMany({
          data: faqsList.map((f) => ({
            question: f.question,
            answer: f.answer,
            plantId: plant.id,
          })),
        });
      }

      await tx.auditLog.create({
        data: {
          userId: userId,
          action: 'CREATE_PLANT',
          targetId: plant.id,
          details: `Created plant: "${englishName}"`,
        },
      });
    });

  } catch (error: any) {
    console.error(error);
    return { error: error.message || 'Failed to create plant profile.' };
  }

  redirect('/cms');
}

// 3. Create Taxonomic Family Action
export async function createFamilyAction(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  // Rate Limiting Check
  const rateCheck = await checkRateLimit('create-family', 5, 60000);
  if (!rateCheck.success) {
    return { error: rateCheck.error };
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;

  if (!name || !slug || !description) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    const slugExists = await prisma.family.findUnique({ where: { slug } });
    if (slugExists) return { error: 'A family with this slug already exists.' };

    await prisma.family.create({
      data: { name, slug: slug.toLowerCase().trim(), description },
    });
  } catch (error: any) {
    return { error: error.message || 'Failed to create family.' };
  }

  redirect('/cms');
}

// 4. Create Disease Indication Action
export async function createDiseaseAction(prevState: any, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  // Rate Limiting Check
  const rateCheck = await checkRateLimit('create-disease', 5, 60000);
  if (!rateCheck.success) {
    return { error: rateCheck.error };
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;

  if (!name || !slug || !description) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    const slugExists = await prisma.disease.findUnique({ where: { slug } });
    if (slugExists) return { error: 'A disease with this slug already exists.' };

    await prisma.disease.create({
      data: { name, slug: slug.toLowerCase().trim(), description },
    });
  } catch (error: any) {
    return { error: error.message || 'Failed to create disease.' };
  }

  redirect('/cms');
}

// 5. Create Plant Part Action
export async function createPartAction(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized.' };

  const rateCheck = await checkRateLimit('create-part', 5, 60000);
  if (!rateCheck.success) return { error: rateCheck.error };

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;

  if (!name || !slug) return { error: 'Please fill in all required fields.' };

  try {
    const slugExists = await prisma.plantPart.findUnique({ where: { slug } });
    if (slugExists) return { error: 'A plant part with this slug already exists.' };

    await prisma.plantPart.create({
      data: { name, slug: slug.toLowerCase().trim(), description: description || null },
    });
  } catch (error: any) {
    return { error: error.message || 'Failed to create plant part.' };
  }

  redirect('/cms');
}

// 6. Create Medicinal Action Action
export async function createActionAction(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized.' };

  const rateCheck = await checkRateLimit('create-action', 5, 60000);
  if (!rateCheck.success) return { error: rateCheck.error };

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;

  if (!name || !slug || !description) return { error: 'Please fill in all required fields.' };

  try {
    const slugExists = await prisma.medicinalAction.findUnique({ where: { slug } });
    if (slugExists) return { error: 'A medicinal action with this slug already exists.' };

    await prisma.medicinalAction.create({
      data: { name, slug: slug.toLowerCase().trim(), description },
    });
  } catch (error: any) {
    return { error: error.message || 'Failed to create medicinal action.' };
  }

  redirect('/cms');
}

// 7. Delete Actions
export async function deletePostAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized.');

  await prisma.post.delete({ where: { id } });
  redirect('/cms');
}

export async function deletePlantAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized.');

  await prisma.plant.delete({ where: { id } });
  redirect('/cms');
}

export async function deleteFamilyAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized.');

  await prisma.family.delete({ where: { id } });
  redirect('/cms');
}

export async function deleteDiseaseAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized.');

  await prisma.disease.delete({ where: { id } });
  redirect('/cms');
}
