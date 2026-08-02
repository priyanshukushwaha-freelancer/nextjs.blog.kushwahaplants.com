import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const baseUrl = 'https://nextjs.blog.kushwahaplants.com'; // Read from env/headers in prod

  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
      take: 20,
    });
  } catch (error) {
    console.error('Error fetching RSS posts:', error);
  }

  const currentDate = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Kushwaha Plants Editorial Archive</title>
    <link>${baseUrl}/blog</link>
    <description>India\'s premier medicinal plants, Ayurveda energetics, and scientific research publications.</description>
    <language>en-IN</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />`;

  posts.forEach((post) => {
    rss += `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid>${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      <author>${post.author.name || 'Staff Botanist'}</author>
    </item>`;
  });

  rss += `
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=18000, s-maxage=18000',
    },
  });
}
export const dynamic = 'force-dynamic';
