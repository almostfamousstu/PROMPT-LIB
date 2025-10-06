'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { PromptCard } from '@/components/prompt/PromptCard';
import type { Prompt } from '@/types';
import { duplicatePrompt, deletePrompt } from '@/actions/prompts';
import { toast } from 'sonner';
import Fuse from 'fuse.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RelativeTime } from '@/components/prompt/RelativeTime';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const SAMPLE_ATTRIBUTE_SNIPPET = `{
  "Color": "Red",
  "Material": "Steel"
}`;

interface PromptListProps {
  prompts: Prompt[];
  query?: string;
  tag?: string;
  folder?: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onChanged?: () => Promise<void> | void;
}

type ViewMode = 'grid' | 'list';

export function PromptList({
  prompts,
  query,
  tag,
  folder,
  isLoading = false,
  isRefreshing = false,
  onChanged
}: PromptListProps) {
  const [localPrompts, setLocalPrompts] = useState(prompts);
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<ViewMode>('grid');
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null);

  useEffect(() => {
    setLocalPrompts(prompts);
  }, [prompts]);

  const refreshFromServer = async () => {
    await onChanged?.();
  };

  const filteredPrompts = useMemo(() => {
    let result = localPrompts;
    if (folder) {
      result = result.filter((prompt) => prompt.folder === folder);
    }
    if (tag) {
      result = result.filter((prompt) => prompt.tags.includes(tag));
    }
    if (query) {
      const fuse = new Fuse(result, {
        keys: ['title', 'body_md', 'tags'],
        threshold: 0.3
      });
      result = fuse.search(query).map((item) => item.item);
    }
    return result;
  }, [folder, localPrompts, query, tag]);

  const handleDuplicate = (id: string) => {
    startTransition(() => {
      const promise = duplicatePrompt(id).then(async () => {
        await refreshFromServer();
      });
      toast.promise(promise, {
        loading: 'Duplicating prompt…',
        success: 'Prompt duplicated',
        error: 'Failed to duplicate prompt'
      });
    });
  };

  const handleDelete = (id: string) => {
    setLocalPrompts((current) => current.filter((prompt) => prompt.id !== id));
    startTransition(() => {
      const promise = deletePrompt(id)
        .then(async () => {
          await refreshFromServer();
        })
        .catch(async (error) => {
          await refreshFromServer();
          throw error;
        });
      toast.promise(promise, {
        loading: 'Deleting prompt…',
        success: 'Prompt deleted',
        error: (err) => err.message ?? 'Failed to delete prompt'
      });
    });
  };

  const handleCopy = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.body_md);
    toast.success('Prompt copied to clipboard');
  };

  const openPreview = (prompt: Prompt) => {
    setPreviewPrompt(prompt);
  };

  useEffect(() => {
    if (!previewPrompt) {
      return;
    }
    const updated = localPrompts.find((item) => item.id === previewPrompt.id);
    if (updated) {
      setPreviewPrompt(updated);
    } else {
      setPreviewPrompt(null);
    }
  }, [localPrompts, previewPrompt]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-lg border border-dashed bg-muted/40" />
        ))}
      </div>
    );
  }

  if (!filteredPrompts.length && !isPending && !isRefreshing) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">No prompts yet</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Create your first prompt to build a reusable library. Optimise them with AI, add tags, and keep versions to ensure your team stays in sync.
        </p>
        <Button asChild>
          <Link href="/prompts/new">Create prompt</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'}
            {isPending && ' (updating…)'}
            {isRefreshing && ' (refreshing…)'}
        </p>
        <div className="flex gap-2">
          <Button variant={view === 'grid' ? 'secondary' : 'outline'} size="sm" onClick={() => setView('grid')}>
            Cards
          </Button>
          <Button variant={view === 'list' ? 'secondary' : 'outline'} size="sm" onClick={() => setView('list')}>
            List
          </Button>
        </div>
      </div>
      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onPreview={openPreview}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Folder</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrompts.map((prompt) => (
                <TableRow key={prompt.id} className={cn(isPending && 'opacity-50')}>
                  <TableCell className="font-medium">
                    <Link href={`/prompts/${prompt.id}`} className="hover:underline">
                      {prompt.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prompt.tags.map((tagValue) => (
                        <Badge key={tagValue} variant="secondary" className="capitalize">
                          {tagValue}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{prompt.folder}</TableCell>
                  <TableCell className="text-muted-foreground">
                    <RelativeTime value={prompt.updated_at} addSuffix />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openPreview(prompt)}>
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(prompt)}>
                      <Copy className="mr-1 h-4 w-4" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/prompts/${prompt.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      </div>
      <Dialog open={Boolean(previewPrompt)} onOpenChange={(open) => !open && setPreviewPrompt(null)}>
        <DialogContent className="max-w-3xl gap-6">
          {previewPrompt ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">{previewPrompt.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Last updated</span>
                  <RelativeTime value={previewPrompt.updated_at} addSuffix />
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                    {previewPrompt.folder}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] rounded-md border bg-muted/30 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {previewPrompt.body_md}
                </pre>
              </ScrollArea>
              <details className="w-full rounded-md border border-dashed bg-background p-3 text-xs text-muted-foreground">
                <summary className="cursor-pointer font-medium text-foreground">Need a JSON attribute template?</summary>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/80">
                  {SAMPLE_ATTRIBUTE_SNIPPET}
                </pre>
              </details>
              <div className="flex flex-wrap gap-2">
                {previewPrompt.tags.length ? (
                  previewPrompt.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="capitalize">
                      #{tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
              </div>
              <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Use the actions to copy, duplicate, or jump into the editor for full control.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <Link href={`/prompts/${previewPrompt.id}`}>Open in editor</Link>
                  </Button>
                  <Button variant="secondary" onClick={() => previewPrompt && void handleCopy(previewPrompt)}>
                    <Copy className="mr-2 h-4 w-4" /> Copy prompt
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (!previewPrompt) return;
                      setPreviewPrompt(null);
                      handleDuplicate(previewPrompt.id);
                    }}
                  >
                    Duplicate
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
