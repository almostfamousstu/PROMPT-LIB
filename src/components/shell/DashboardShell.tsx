'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/db';
import type { Prompt } from '@/types';
import { normalizePrompt } from '@/lib/utils';
import { AppTopbar } from '@/components/shell/AppTopbar';
import { AppSidebar } from '@/components/shell/AppSidebar';
import { PromptList } from '@/components/prompt/PromptList';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DashboardShellProps {
  userId: string;
  userEmail?: string;
  initialQuery?: string;
  initialFolder?: string;
  initialTag?: string;
}

export function DashboardShell({
  userId,
  userEmail,
  initialQuery,
  initialFolder,
  initialTag
}: DashboardShellProps) {
  const supabase = useMemo(() => createClientComponentClient<Database>(), []);
  const searchParams = useSearchParams();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshPrompts = useCallback(
    async (options?: { silent?: boolean }) => {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const { data, error: queryError } = await supabase
          .from('prompts')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (queryError) {
          throw queryError;
        }

        setPrompts((data ?? []).map(normalizePrompt));
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load prompts';
        if (options?.silent) {
          toast.error(message);
        } else {
          setError(message);
        }
      } finally {
        if (options?.silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [supabase, userId]
  );

  useEffect(() => {
    refreshPrompts();
  }, [refreshPrompts]);

  const query = searchParams.get('q') ?? initialQuery ?? undefined;
  const folder = searchParams.get('folder') ?? initialFolder ?? undefined;
  const tag = searchParams.get('tag') ?? initialTag ?? undefined;

  const folders = useMemo(() => {
    return Array.from(new Set(prompts.map((prompt) => prompt.folder))).filter((value) => value && value !== 'Library');
  }, [prompts]);

  const tags = useMemo(() => {
    return Array.from(new Set(prompts.flatMap((prompt) => prompt.tags))).filter(Boolean);
  }, [prompts]);

  const handleRefresh = useCallback(async () => {
    await refreshPrompts({ silent: true });
  }, [refreshPrompts]);

  return (
    <div className="flex h-screen flex-col">
      <AppTopbar prompts={prompts.map(({ id, title, tags }) => ({ id, title, tags }))} userEmail={userEmail} />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar folders={folders} tags={tags} />
        <main className="flex-1 overflow-auto bg-muted/10 p-6">
          {error && !prompts.length ? (
            <div className="flex h-full flex-1 flex-col items-center justify-center space-y-4 rounded-lg border border-destructive/40 bg-background p-8 text-center">
              <div>
                <h3 className="text-lg font-semibold">Unable to load your prompts</h3>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={() => refreshPrompts()}>Try again</Button>
            </div>
          ) : (
            <PromptList
              prompts={prompts}
              query={query}
              tag={tag}
              folder={folder}
              isLoading={isLoading && !prompts.length}
              isRefreshing={isRefreshing}
              onChanged={handleRefresh}
            />
          )}
        </main>
      </div>
    </div>
  );
}
