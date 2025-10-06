import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/db';
import { DashboardShell } from '@/components/shell/DashboardShell';

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

  return (
    <DashboardShell
      userId={user.id}
      userEmail={user.email ?? undefined}
      initialQuery={searchParams.q}
      initialFolder={searchParams.folder}
      initialTag={searchParams.tag}
    />
  );
}
