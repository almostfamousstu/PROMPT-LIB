import { describe, expect, it, vi } from 'vitest';
import { createUnifiedDiff, withRetry } from '@/lib/utils';

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
