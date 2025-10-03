import { z } from 'zod';
import { promptSchema } from '@/lib/schema';

export type Prompt = z.infer<typeof promptSchema> & { id: string; created_at: string; updated_at: string };

export type PromptVersion = {
  id: string;
  prompt_id: string;
  body_md: string;
  notes?: string | null;
  created_at: string;
};

export type OptimizeResponse = {
  optimized: string;
  rationale?: string;
};
