import { NextResponse } from 'next/server';
import { getAutocompleteSuggestions } from '@/services/search';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  // Rate limit API to 60 requests per minute per IP
  const rateCheck = await checkRateLimit('api-suggestions', 60, 60000);
  if (!rateCheck.success) {
    return NextResponse.json({ error: rateCheck.error }, { status: 429 });
  }

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
export const dynamic = 'force-dynamic';
