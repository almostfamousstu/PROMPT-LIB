import { z } from 'zod';

export const promptSchema = z.object({
  title: z.string().min(1, 'Title is required').max(180),
  body_md: z.string().min(1, 'Prompt body is required'),
  tags: z.array(z.string()).default([]),
  folder: z.string().min(1).default('Library')
});

export const promptVersionSchema = z.object({
  prompt_id: z.string().uuid(),
  body_md: z.string().min(1),
  notes: z.string().optional().nullable()
});

export const searchSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folder: z.string().optional()
});

export const optimizeSchema = z.object({
  prompt: z.string().min(10, 'Provide more context to optimize'),
  style: z.string().optional()
});

export type PromptInput = z.infer<typeof promptSchema>;
export type PromptVersionInput = z.infer<typeof promptVersionSchema>;
