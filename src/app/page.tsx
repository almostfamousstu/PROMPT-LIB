import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/db';
import { DashboardShell } from '@/components/shell/DashboardShell';
import { normalizePrompt } from '@/lib/utils';

interface PageProps {
  searchParams: {
    q?: string;
    folder?: string;
    tag?: string;
  };
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: promptRows, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const initialPrompts = (promptRows ?? []).map(normalizePrompt);

  return (
    <DashboardShell
      userId={user.id}
      userEmail={user.email ?? undefined}
      initialQuery={searchParams.q}
      initialFolder={searchParams.folder}
      initialTag={searchParams.tag}
      initialPrompts={initialPrompts}
      initialError={promptError?.message}
    />
  );
}
