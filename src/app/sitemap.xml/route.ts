import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const baseUrl = 'https://nextjs.blog.kushwahaplants.com'; // In production, read from headers or env

  let plants: any[] = [];
  let posts: any[] = [];
  let families: any[] = [];
  let diseases: any[] = [];
  let actions: any[] = [];

  try {
    [plants, posts, families, diseases, actions] = await Promise.all([
      prisma.plant.findMany({ include: { images: true } }),
      prisma.post.findMany({ where: { status: 'PUBLISHED' } }),
      prisma.family.findMany(),
      prisma.disease.findMany(),
      prisma.medicinalAction.findMany(),
    ]);
  } catch (e) {
    console.error('Error fetching sitemap entities:', e);
  }

  // Create XML elements
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // Helper to add URL nodes
  const addUrl = (loc: string, lastmod: string, changefreq: string, priority: string, imageUrls: string[] = []) => {
    let node = `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

    imageUrls.forEach((imgUrl) => {
      node += `
    <image:image>
      <image:loc>${imgUrl}</image:loc>
    </image:image>`;
    });

    node += `
  </url>`;
    xml += node;
  };

  const currentDate = new Date().toISOString();

  // Root URLs
  addUrl(baseUrl, currentDate, 'daily', '1.0');
  addUrl(`${baseUrl}/plants`, currentDate, 'daily', '0.9');
  addUrl(`${baseUrl}/families`, currentDate, 'weekly', '0.8');
  addUrl(`${baseUrl}/diseases`, currentDate, 'weekly', '0.8');
  addUrl(`${baseUrl}/uses`, currentDate, 'weekly', '0.8');
  addUrl(`${baseUrl}/blog`, currentDate, 'daily', '0.9');
  addUrl(`${baseUrl}/search`, currentDate, 'monthly', '0.5');

  // Plant Profile URLs with Image Sitemaps
  plants.forEach((plant) => {
    const images = plant.images.map((img: any) => img.url);
    addUrl(`${baseUrl}/plants/${plant.slug}`, plant.updatedAt.toISOString(), 'daily', '0.8', images);
  });

  // Editorial Post URLs
  posts.forEach((post) => {
    addUrl(`${baseUrl}/blog/${post.slug}`, post.updatedAt.toISOString(), 'weekly', '0.7');
  });

  // Taxonomic families, diseases, actions
  families.forEach((family) => {
    addUrl(`${baseUrl}/families/${family.slug}`, currentDate, 'weekly', '0.6');
  });

  diseases.forEach((disease) => {
    addUrl(`${baseUrl}/diseases/${disease.slug}`, currentDate, 'weekly', '0.6');
  });

  actions.forEach((action) => {
    addUrl(`${baseUrl}/uses/${action.slug}`, currentDate, 'weekly', '0.6');
  });

  xml += `
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
export const dynamic = 'force-dynamic';
