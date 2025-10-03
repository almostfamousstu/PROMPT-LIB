import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/db';
import { PromptPlayground } from '@/components/prompt/PromptPlayground';
import type { Prompt } from '@/types';

export default async function PlaygroundPage() {
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

  return (
    <main className="mx-auto max-w-5xl space-y-6 py-10">
      <PromptPlayground prompts={(prompts as Prompt[]) ?? []} />
    </main>
  );
}
