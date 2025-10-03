'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { createUnifiedDiff } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OptimizePanelProps {
  original: string;
  optimized: string;
  rationale?: string;
  open: boolean;
  onClose: () => void;
  onReplace: () => void;
  onCreateVersion: () => void;
}

export function OptimizePanel({ original, optimized, rationale, open, onClose, onReplace, onCreateVersion }: OptimizePanelProps) {
  const diff = React.useMemo(() => createUnifiedDiff(original, optimized), [original, optimized]);

  return (
    <Dialog open={open} onOpenChange={(value) => (!value ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>AI Optimization</DialogTitle>
          <DialogDescription>{rationale ?? 'Review the AI-suggested improvements before applying.'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 overflow-y-auto">
          <section className="space-y-2 rounded-lg border p-3">
            <h3 className="text-sm font-semibold">Unified diff</h3>
            <pre className="max-h-80 overflow-auto rounded bg-muted p-3 text-xs">
              {diff.map((part, index) => (
                <span
                  key={`${part.value}-${index}`}
                  className={part.added ? 'text-emerald-500' : part.removed ? 'text-red-500' : 'text-muted-foreground'}
                >
                  {part.added ? '+ ' : part.removed ? '- ' : '  '}
                  {part.value}
                </span>
              ))}
            </pre>
          </section>
          <section className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-semibold">Original</h3>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} className="prose prose-sm dark:prose-invert">
                {original}
              </ReactMarkdown>
            </div>
            <div className="rounded-lg border p-3">
              <h3 className="text-sm font-semibold">Optimized</h3>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} className="prose prose-sm dark:prose-invert">
                {optimized}
              </ReactMarkdown>
            </div>
          </section>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="outline" onClick={onCreateVersion}>
            Insert as new version
          </Button>
          <Button onClick={onReplace}>Replace prompt</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
