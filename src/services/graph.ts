import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

export interface GraphNode {
  id: string;
  label: string;
  type: 'plant' | 'family' | 'disease' | 'action' | 'part' | 'research' | 'post';
  slug?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  label?: string;
}

export interface VisualGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export async function getPlantGraphData(slug: string): Promise<VisualGraphData | null> {
  const cacheKey = `graph:plant:${slug}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const plant = await prisma.plant.findUnique({
    where: { slug },
    include: {
      family: true,
      parts: { include: { part: true } },
      diseases: { include: { disease: true } },
      actions: { include: { action: true } },
      research: true,
      posts: { include: { post: true } },
    },
  });

  if (!plant) return null;

  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Core Plant Node
  nodes.push({
    id: plant.id,
    label: `${plant.englishName} (${plant.scientificName})`,
    type: 'plant',
    slug: plant.slug,
  });

  // Family Node
  nodes.push({
    id: plant.family.id,
    label: `${plant.family.name} Family`,
    type: 'family',
    slug: plant.family.slug,
  });
  links.push({ source: plant.id, target: plant.family.id, label: 'belongs to' });

  // Disease Nodes
  plant.diseases.forEach(({ disease }) => {
    nodes.push({
      id: disease.id,
      label: disease.name,
      type: 'disease',
      slug: disease.slug,
    });
    links.push({ source: plant.id, target: disease.id, label: 'treats' });
  });

  // Medicinal Action Nodes
  plant.actions.forEach(({ action }) => {
    nodes.push({
      id: action.id,
      label: action.name,
      type: 'action',
      slug: action.slug,
    });
    links.push({ source: plant.id, target: action.id, label: 'possesses action' });
  });

  // Plant Part Nodes
  plant.parts.forEach(({ part }) => {
    nodes.push({
      id: part.id,
      label: part.name,
      type: 'part',
      slug: part.slug,
    });
    links.push({ source: plant.id, target: part.id, label: 'utilizes part' });
  });

  // Research Paper Nodes (Limit to top 3 for visualization)
  plant.research.slice(0, 3).forEach((paper) => {
    nodes.push({
      id: paper.id,
      label: `${paper.authors.split(',')[0]} (${paper.year})`,
      type: 'research',
    });
    links.push({ source: plant.id, target: paper.id, label: 'supported by' });
  });

  // Post Nodes (Limit to top 3 for visualization)
  plant.posts.slice(0, 3).forEach(({ post }) => {
    nodes.push({
      id: post.id,
      label: post.title,
      type: 'post',
      slug: post.slug,
    });
    links.push({ source: plant.id, target: post.id, label: 'discussed in' });
  });

  const graphData: VisualGraphData = { nodes, links };

  // Cache graph data for 6 hours
  await redis.set(cacheKey, JSON.stringify(graphData), 'EX', 21600);

  return graphData;
}

export async function getConnectedEntitiesSummary(plantId: string) {
  const [diseases, actions, parts, research] = await Promise.all([
    prisma.disease.findMany({
      where: { plants: { some: { plantId } } },
      select: { name: true, slug: true },
    }),
    prisma.medicinalAction.findMany({
      where: { plants: { some: { plantId } } },
      select: { name: true, slug: true },
    }),
    prisma.plantPart.findMany({
      where: { plants: { some: { plantId } } },
      select: { name: true, slug: true },
    }),
    prisma.research.findMany({
      where: { plantId },
      select: { title: true, journal: true, year: true, url: true },
    }),
  ]);

  return { diseases, actions, parts, research };
}
