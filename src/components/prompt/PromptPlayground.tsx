'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Prompt } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PromptPlaygroundProps {
  prompts: Prompt[];
}

export function PromptPlayground({ prompts }: PromptPlaygroundProps) {
  const [selectedId, setSelectedId] = useState(prompts[0]?.id ?? '');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const selectedPrompt = useMemo(() => prompts.find((prompt) => prompt.id === selectedId) ?? prompts[0], [prompts, selectedId]);

  useEffect(() => {
    if (!selectedPrompt) return;
    const found = Array.from(new Set(selectedPrompt.body_md.match(/{{(.*?)}}/g)?.map((match) => match.replace(/[{}]/g, '')) ?? []));
    const defaults: Record<string, string> = {};
    found.forEach((variable) => {
      defaults[variable] = variables[variable] ?? '';
    });
    setVariables(defaults);
  }, [selectedPrompt]);

  if (!selectedPrompt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Playground</CardTitle>
          <CardDescription>Create prompts first to use the playground.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const resolvedPrompt = selectedPrompt.body_md.replace(/{{(.*?)}}/g, (_, key: string) => variables[key] ?? `{{${key}}}`);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(resolvedPrompt);
    toast.success('Prompt copied with variables');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt Playground</CardTitle>
        <CardDescription>Test and fill variables before sending a prompt to your favourite LLM.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Choose prompt</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedPrompt.id}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {prompts.map((prompt) => (
              <option key={prompt.id} value={prompt.id}>
                {prompt.title}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2 pt-2">
            {selectedPrompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="capitalize">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground">Variables</h3>
          {Object.keys(variables).length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(variables).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{key}</label>
                  <Input value={value} onChange={(event) => setVariables((prev) => ({ ...prev, [key]: event.target.value }))} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No dynamic variables detected in this prompt.</p>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Resolved prompt</h3>
          <Textarea value={resolvedPrompt} readOnly className="min-h-[200px]" />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setVariables({})}>
            Reset
          </Button>
          <Button onClick={handleCopy}>Copy prompt</Button>
        </div>
      </CardContent>
    </Card>
  );
}
