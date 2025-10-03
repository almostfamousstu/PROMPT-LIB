import OpenAI from 'openai';
import { withRetry } from '@/lib/utils';

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-5';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. Optimize endpoint will fail until provided.');
}

const client = OPENAI_API_KEY
  ? new OpenAI({
      apiKey: OPENAI_API_KEY,
      maxRetries: 0,
      timeout: 15_000
    })
  : null;

const systemPrompt = `You are PromptSmith, an elite AI tasked with rewriting prompts to maximize clarity, explicit objectives, persona, constraints, tools, and expected outputs.\n- Produce numbered sections with concise instructions.\n- Clarify role, audience, inputs, outputs, evaluation metrics, and guardrails.\n- Remove ambiguity, specify success criteria, and add validation/test cases when relevant.\n- Keep within 600 tokens, avoid markdown tables, ensure copy-paste ready.\nRespond as JSON with keys \\"optimized\\" and \\"rationale\\".`;

export function buildOptimizePayload(prompt: string, style?: string) {
  return {
    model: OPENAI_MODEL,
    temperature: 0.3,
    max_tokens: 600,
    messages: [
      {
        role: 'system' as const,
        content: systemPrompt + (style ? `\nPreferred style: ${style}` : '')
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ]
  };
}

export async function optimizePrompt({
  prompt,
  style
}: {
  prompt: string;
  style?: string;
}): Promise<{ optimized: string; rationale: string } | null> {
  if (!client) return null;

  const payload = buildOptimizePayload(prompt, style);

  const response = await withRetry(async () => {
    return client.chat.completions.create(payload);
  }, 2, 800);

  const raw = response.choices[0]?.message?.content ?? '';
  try {
    const parsed = JSON.parse(raw);
    return {
      optimized: String(parsed.optimized ?? '').trim(),
      rationale: String(parsed.rationale ?? 'Improved for clarity and completeness.').trim()
    };
  } catch (error) {
    console.error('Failed to parse OpenAI response', error, raw);
    return {
      optimized: raw.trim(),
      rationale: 'Optimized using fallback parser.'
    };
  }
}
