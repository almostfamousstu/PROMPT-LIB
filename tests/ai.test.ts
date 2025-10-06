import { describe, expect, it } from 'vitest';
import { buildOptimizePayload } from '@/lib/ai';

describe('buildOptimizePayload', () => {
  it('constructs payload with system and user messages', () => {
    const payload = buildOptimizePayload('Test prompt', 'Succinct');
    expect(payload.model).toBeDefined();
    expect(payload.messages[0].role).toBe('system');
    expect(payload.messages[1].content).toBe('Test prompt');
    expect(payload.messages[0].content).toContain('Preferred style: Succinct');
  });
});
