'use server';

import { revalidatePath } from 'next/cache';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { promptSchema, promptVersionSchema, searchSchema } from '@/lib/schema';
import type { Database } from '@/lib/db';

let actionClient = () => createServerActionClient<Database>({ cookies });

export function __setActionClient(mock: typeof actionClient) {
  actionClient = mock;
}

async function requireUserId() {
  const supabase = actionClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return { supabase, user };
}

export const createPrompt = async (input: z.infer<typeof promptSchema>) => {
  const parsed = promptSchema.parse(input);
  const { supabase, user } = await requireUserId();
  const { data, error } = await supabase
    .from('prompts')
    .insert({ ...parsed, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  await supabase.from('prompt_versions').insert({ prompt_id: data.id, body_md: data.body_md, notes: 'Initial version' });
  revalidatePath('/');
  return data;
};

export const updatePrompt = async (id: string, input: z.infer<typeof promptSchema>) => {
  const parsed = promptSchema.parse(input);
  const { supabase, user } = await requireUserId();
  const { error, data } = await supabase
    .from('prompts')
    .update({ ...parsed, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  await supabase.from('prompt_versions').insert({ prompt_id: id, body_md: parsed.body_md, notes: 'Edited' });
  revalidatePath(`/prompts/${id}`);
  revalidatePath('/');
  return data;
};

export const deletePrompt = async (id: string) => {
  const { supabase, user } = await requireUserId();
  const { error } = await supabase.from('prompts').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
  revalidatePath('/');
};

export const duplicatePrompt = async (id: string) => {
  const { supabase, user } = await requireUserId();
  const { data: prompt, error } = await supabase.from('prompts').select('*').eq('id', id).single();
  if (error || !prompt) throw error ?? new Error('Prompt not found');
  const { data: duplicate, error: dupError } = await supabase
    .from('prompts')
    .insert({
      title: `${prompt.title} (Copy)`,
      body_md: prompt.body_md,
      tags: Array.isArray(prompt.tags) ? prompt.tags : [],
      folder: prompt.folder,
      user_id: user.id
    })
    .select()
    .single();
  if (dupError) throw dupError;
  await supabase
    .from('prompt_versions')
    .insert({ prompt_id: duplicate.id, body_md: duplicate.body_md, notes: 'Duplicated from existing prompt' });
  revalidatePath('/');
  return duplicate;
};

export const createVersion = async (input: z.infer<typeof promptVersionSchema>) => {
  const parsed = promptVersionSchema.parse(input);
  const { supabase, user } = await requireUserId();
  const { data: prompt } = await supabase.from('prompts').select('user_id').eq('id', parsed.prompt_id).single();
  if (!prompt || prompt.user_id !== user.id) {
    throw new Error('Unauthorized');
  }
  const { data, error } = await supabase.from('prompt_versions').insert(parsed).select().single();
  if (error) throw error;
  revalidatePath(`/prompts/${parsed.prompt_id}`);
  return data;
};

export const restoreVersion = async (versionId: string) => {
  const { supabase, user } = await requireUserId();
  const { data: version, error } = await supabase.from('prompt_versions').select('*').eq('id', versionId).single();
  if (error || !version) throw error ?? new Error('Version not found');
  const { data: prompt } = await supabase.from('prompts').select('id', 'user_id').eq('id', version.prompt_id).single();
  if (!prompt || prompt.user_id !== user.id) throw new Error('Unauthorized');
  await supabase
    .from('prompts')
    .update({ body_md: version.body_md, updated_at: new Date().toISOString() })
    .eq('id', version.prompt_id);
  revalidatePath(`/prompts/${version.prompt_id}`);
  revalidatePath('/');
  return version.prompt_id;
};

export const searchPrompts = async (input: unknown) => {
  const parsed = searchSchema.parse(input ?? {});
  const { supabase, user } = await requireUserId();
  let query = supabase.from('prompts').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
  if (parsed.query) {
    query = query.ilike('title', `%${parsed.query}%`);
  }
  if (parsed.folder) {
    query = query.eq('folder', parsed.folder);
  }
  if (parsed.tags?.length) {
    query = query.contains('tags', parsed.tags);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
};
