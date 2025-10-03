import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/db';
import { PromptEditor } from '@/components/prompt/PromptEditor';
import { updatePrompt, restoreVersion } from '@/actions/prompts';
import type { Prompt, PromptVersion } from '@/types';

interface PromptPageProps {
  params: { id: string };
}

export default async function PromptPage({ params }: PromptPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (!prompt) {
    notFound();
  }

  const { data: versions } = await supabase
    .from('prompt_versions')
    .select('*')
    .eq('prompt_id', params.id)
    .order('created_at', { ascending: false });

  const { data: prompts } = await supabase
    .from('prompts')
    .select('tags, folder')
    .eq('user_id', user.id);

  const folders = Array.from(new Set((prompts ?? []).map((p) => p.folder))).filter(Boolean);
  const tagSuggestions = Array.from(new Set((prompts ?? []).flatMap((p) => p.tags ?? []))).filter(Boolean);

  async function handleSubmit(data: { title: string; body_md: string; tags: string[]; folder: string }) {
    'use server';
    await updatePrompt(params.id, data);
  }

  async function handleRestore(versionId: string) {
    'use server';
    await restoreVersion(versionId);
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 py-10">
      <PromptEditor
        promptId={params.id}
        title={(prompt as Prompt).title}
        body={(prompt as Prompt).body_md}
        tags={(prompt as Prompt).tags}
        folder={(prompt as Prompt).folder}
        versions={(versions as PromptVersion[]) ?? []}
        suggestions={tagSuggestions}
        folders={folders}
        onSubmit={handleSubmit}
        onRestore={handleRestore}
      />
    </main>
  );
}
