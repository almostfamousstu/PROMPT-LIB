import { beforeEach, describe, expect, it, vi } from 'vitest';
import { __setActionClient, createPrompt, searchPrompts } from '@/actions/prompts';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

const user = { id: 'user-1' };
let stub: ReturnType<typeof createSupabaseStub>;

function createSupabaseStub() {
  const insertSingle = vi.fn().mockResolvedValue({ data: { id: 'prompt-1', body_md: 'Body' }, error: null });
  const selectSingle = vi.fn().mockReturnValue({ single: insertSingle });
  const insert = vi.fn().mockReturnValue({ select: selectSingle });
  const versionInsert = vi.fn().mockReturnValue({});

  const auth = {
    getUser: vi.fn().mockResolvedValue({ data: { user } })
  };

  const queryResult = { data: [], error: null };
  const query = {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    then: (resolve: (value: typeof queryResult) => unknown) => Promise.resolve(queryResult).then(resolve)
  } as any;

  const from = vi.fn((table: string) => {
    if (table === 'prompts') {
      return {
        insert,
        select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: [{ id: 'prompt-1' }], error: null }) }),
        eq: query.eq,
        order: query.order,
        ilike: query.ilike,
        contains: query.contains,
        then: query.then
      } as any;
    }
    if (table === 'prompt_versions') {
      return {
        insert: versionInsert
      } as any;
    }
    return {} as any;
  });

  return {
    auth,
    from,
    insert,
    insertSingle,
    versionInsert,
    query
  };
}

describe('prompt actions', () => {
  beforeEach(() => {
    stub = createSupabaseStub();
    __setActionClient(() => stub as any);
  });

  it('creates prompt and initial version', async () => {
    const data = await createPrompt({ title: 'Test', body_md: 'Body', tags: [], folder: 'Library' });
    expect(data.id).toBe('prompt-1');
    expect(stub.insert).toHaveBeenCalled();
    expect(stub.versionInsert).toHaveBeenCalledWith({ prompt_id: 'prompt-1', body_md: 'Body', notes: 'Initial version' });
  });

  it('searches prompts with filters', async () => {
    const results = await searchPrompts({ query: 'email' });
    expect(Array.isArray(results)).toBe(true);
    expect(stub.query.ilike).toHaveBeenCalledWith('title', '%email%');
  });
});
