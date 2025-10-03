import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/db';
import { PromptEditor } from '@/components/prompt/PromptEditor';
import { createPrompt } from '@/actions/prompts';

export default async function NewPromptPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: prompts } = await supabase
    .from('prompts')
    .select('tags, folder')
    .eq('user_id', user.id);

  const folders = Array.from(new Set((prompts ?? []).map((prompt) => prompt.folder))).filter(Boolean);
  const tagSuggestions = Array.from(new Set((prompts ?? []).flatMap((prompt) => prompt.tags ?? []))).filter(Boolean);

  async function handleSubmit(data: { title: string; body_md: string; tags: string[]; folder: string }) {
    'use server';
    await createPrompt(data);
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-10">
      <PromptEditor onSubmit={handleSubmit} folders={folders} suggestions={tagSuggestions} />
    </main>
  );
}
