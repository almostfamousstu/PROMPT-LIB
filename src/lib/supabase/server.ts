import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/db';

export function getSupabaseServerClient() {
  return createServerComponentClient<Database>({
    cookies
  });
}
