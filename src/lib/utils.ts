import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { diffLines } from 'diff';
import type { Database } from '@/lib/db';
import type { Prompt } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createUnifiedDiff(before: string, after: string) {
  return diffLines(before, after).map((part) => ({
    added: part.added ?? false,
    removed: part.removed ?? false,
    value: part.value
  }));
}

export function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 500): Promise<T> {
  return fn().catch((error) => {
    if (retries <= 0) {
      throw error;
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        withRetry(fn, retries - 1, delayMs * 2)
          .then(resolve)
          .catch(reject);
      }, delayMs);
    });
  });
}

type PromptRow = Database['public']['Tables']['prompts']['Row'];

export function normalizePrompt(row: PromptRow): Prompt {
  return {
    id: row.id,
    title: row.title,
    body_md: row.body_md,
    tags: Array.isArray(row.tags) ? row.tags : [],
    folder: row.folder ?? 'Library',
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
