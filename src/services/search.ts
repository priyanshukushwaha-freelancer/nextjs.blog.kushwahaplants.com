import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

export interface SearchResult {
  plants: Array<{
    id: string;
    slug: string;
    scientificName: string;
    englishName: string;
    hindiName: string | null;
    sanskritName: string | null;
    description: string;
    family: { name: string; slug: string };
  }>;
  posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    createdAt: Date;
  }>;
}

export interface Suggestion {
  title: string;
  type: 'plant' | 'family' | 'disease' | 'article';
  slug: string;
}

export async function searchPlatform(query: string, filters?: {
  family?: string;
  part?: string;
  disease?: string;
  action?: string;
}): Promise<SearchResult> {
  const cleanQuery = query.trim().replace(/[^a-zA-Z0-9\s\u0900-\u097F]/g, ''); // Allow Sanskrit/Hindi characters
  if (!cleanQuery) {
    return { plants: [], posts: [] };
  }

  // Record query frequency in Redis for analytics / popular suggestions
  await redis.set(`search:query:${cleanQuery.toLowerCase()}`, Date.now().toString(), 'EX', 86400);

  // Format query for Postgres full-text search (using websearch syntax or converting spaces to '&' / '|' operators)
  const ftsQuery = cleanQuery.split(/\s+/).filter(Boolean).map(token => `${token}:*`).join(' & ');

  // 1. Query Plants
  const plants = await prisma.plant.findMany({
    where: {
      AND: [
        // Full text search
        {
          OR: [
            { scientificName: { search: ftsQuery } },
            { englishName: { search: ftsQuery } },
            { hindiName: { search: ftsQuery } },
            { sanskritName: { search: ftsQuery } },
            { description: { search: ftsQuery } },
          ],
        },
        // Taxonomic Filters
        filters?.family ? { family: { slug: filters.family } } : {},
        filters?.part ? { parts: { some: { part: { slug: filters.part } } } } : {},
        filters?.disease ? { diseases: { some: { disease: { slug: filters.disease } } } } : {},
        filters?.action ? { actions: { some: { action: { slug: filters.action } } } } : {},
      ],
    },
    select: {
      id: true,
      slug: true,
      scientificName: true,
      englishName: true,
      hindiName: true,
      sanskritName: true,
      description: true,
      family: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    take: 15,
  });

  // Fallback to basic case-insensitive ILIKE if Prisma FTS returns nothing (for typos/partial words)
  let finalPlants = plants;
  if (finalPlants.length === 0) {
    finalPlants = await prisma.plant.findMany({
      where: {
        AND: [
          {
            OR: [
              { scientificName: { contains: cleanQuery, mode: 'insensitive' } },
              { englishName: { contains: cleanQuery, mode: 'insensitive' } },
              { hindiName: { contains: cleanQuery, mode: 'insensitive' } },
              { sanskritName: { contains: cleanQuery, mode: 'insensitive' } },
              { description: { contains: cleanQuery, mode: 'insensitive' } },
            ],
          },
          filters?.family ? { family: { slug: filters.family } } : {},
          filters?.part ? { parts: { some: { part: { slug: filters.part } } } } : {},
          filters?.disease ? { diseases: { some: { disease: { slug: filters.disease } } } } : {},
          filters?.action ? { actions: { some: { action: { slug: filters.action } } } } : {},
        ],
      },
      select: {
        id: true,
        slug: true,
        scientificName: true,
        englishName: true,
        hindiName: true,
        sanskritName: true,
        description: true,
        family: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      take: 15,
    });
  }

  // 2. Query Blog Posts
  const posts = await prisma.post.findMany({
    where: {
      AND: [
        { status: 'PUBLISHED' },
        {
          OR: [
            { title: { search: ftsQuery } },
            { excerpt: { search: ftsQuery } },
          ],
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      createdAt: true,
    },
    take: 10,
  });

  let finalPosts = posts;
  if (finalPosts.length === 0) {
    finalPosts = await prisma.post.findMany({
      where: {
        AND: [
          { status: 'PUBLISHED' },
          {
            OR: [
              { title: { contains: cleanQuery, mode: 'insensitive' } },
              { excerpt: { contains: cleanQuery, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        createdAt: true,
      },
      take: 10,
    });
  }

  return { plants: finalPlants, posts: finalPosts };
}

export async function getAutocompleteSuggestions(query: string): Promise<Suggestion[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length < 2) return [];

  // Try fetching cached suggestions from Redis
  const cached = await redis.get(`autocomplete:${cleanQuery}`);
  if (cached) return JSON.parse(cached);

  const suggestions: Suggestion[] = [];

  // Fetch matching plants
  const plants = await prisma.plant.findMany({
    where: {
      OR: [
        { scientificName: { contains: cleanQuery, mode: 'insensitive' } },
        { englishName: { contains: cleanQuery, mode: 'insensitive' } },
        { hindiName: { contains: cleanQuery, mode: 'insensitive' } },
        { sanskritName: { contains: cleanQuery, mode: 'insensitive' } },
      ],
    },
    select: { englishName: true, scientificName: true, slug: true },
    take: 5,
  });

  plants.forEach(p => {
    suggestions.push({
      title: `${p.englishName} (${p.scientificName})`,
      type: 'plant',
      slug: p.slug,
    });
  });

  // Fetch matching families
  const families = await prisma.family.findMany({
    where: { name: { contains: cleanQuery, mode: 'insensitive' } },
    select: { name: true, slug: true },
    take: 2,
  });

  families.forEach(f => {
    suggestions.push({
      title: `${f.name} Family`,
      type: 'family',
      slug: f.slug,
    });
  });

  // Fetch matching diseases
  const diseases = await prisma.disease.findMany({
    where: { name: { contains: cleanQuery, mode: 'insensitive' } },
    select: { name: true, slug: true },
    take: 2,
  });

  diseases.forEach(d => {
    suggestions.push({
      title: d.name,
      type: 'disease',
      slug: d.slug,
    });
  });

  // Cache suggestions for 1 hour
  await redis.set(`autocomplete:${cleanQuery}`, JSON.stringify(suggestions), 'EX', 3600);

  return suggestions;
}
