import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { optimizeSchema } from '@/lib/schema';
import { optimizePrompt } from '@/lib/ai';
import type { Database } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = optimizeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await optimizePrompt(parsed.data);
  if (!result) {
    return NextResponse.json({ error: 'OpenAI client not configured' }, { status: 500 });
  }

  return NextResponse.json(result);
}
