import { NextResponse } from 'next/server';
import { getAutocompleteSuggestions } from '@/services/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (query.trim().length < 2) {
    return NextResponse.json([]);
  }

  try {
    const suggestions = await getAutocompleteSuggestions(query);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Autocomplete suggestions error:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic'; // Prevent dynamic routes from caching
