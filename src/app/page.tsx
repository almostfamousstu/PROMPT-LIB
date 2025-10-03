import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/db';
import { AppSidebar } from '@/components/shell/AppSidebar';
import { AppTopbar } from '@/components/shell/AppTopbar';
import { PromptList } from '@/components/prompt/PromptList';
import type { Prompt } from '@/types';

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

  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  const typedPrompts = (prompts ?? []) as unknown as Prompt[];
  const folders = Array.from(new Set(typedPrompts.map((prompt) => prompt.folder))).filter((folder) => folder !== 'Library');
  const tags = Array.from(new Set(typedPrompts.flatMap((prompt) => prompt.tags))).filter(Boolean);

  return (
    <div className="flex h-screen flex-col">
      <AppTopbar
        prompts={typedPrompts.map(({ id, title, tags }) => ({ id, title, tags }))}
        userEmail={user.email ?? undefined}
      />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar folders={folders} tags={tags} />
        <main className="flex-1 overflow-auto bg-muted/10 p-6">
          <PromptList
            prompts={typedPrompts}
            query={searchParams.q}
            tag={searchParams.tag ?? undefined}
            folder={searchParams.folder ?? undefined}
          />
        </main>
      </div>
    </div>
  );
}
