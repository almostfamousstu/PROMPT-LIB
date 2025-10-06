import { describe, expect, it, vi } from 'vitest';
import { createUnifiedDiff, normalizePrompt, withRetry } from '@/lib/utils';
import type { Database } from '@/lib/db';

describe('createUnifiedDiff', () => {
  it('returns diff entries with added and removed flags', () => {
    const result = createUnifiedDiff('Hello', 'Hello world');
    const added = result.find((part) => part.added);
    const unchanged = result.find((part) => !part.added && !part.removed);

    expect(added).toBeDefined();
    expect(unchanged).toBeDefined();
    expect(added?.value.trim()).toContain('world');
  });
});

describe('withRetry', () => {
  it('retries the provided function and resolves', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');

    const result = await withRetry(fn, 2, 1);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('normalizePrompt', () => {
  it('ensures optional columns fall back to safe defaults', () => {
    const row: Database['public']['Tables']['prompts']['Row'] = {
      id: '123',
      user_id: 'user',
      title: 'Test prompt',
      body_md: 'Body',
      tags: null as unknown as string[],
      folder: null as unknown as string,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const prompt = normalizePrompt(row);

    expect(prompt.tags).toEqual([]);
    expect(prompt.folder).toBe('Library');
  });
});
