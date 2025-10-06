'use client';

import { useCallback, useMemo, useRef, useState, useTransition } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagPicker } from '@/components/prompt/TagPicker';
import { FolderPicker } from '@/components/prompt/FolderPicker';
import { OptimizePanel } from '@/components/prompt/OptimizePanel';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { createVersion } from '@/actions/prompts';
import type { PromptVersion } from '@/types';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, ChevronDown, Copy, Download, History, Loader2, Sparkles, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PromptEditorProps {
  promptId?: string;
  title?: string;
  body?: string;
  tags?: string[];
  folder?: string;
  suggestions?: string[];
  folders?: string[];
  versions?: PromptVersion[];
  onSubmit: (data: { title: string; body_md: string; tags: string[]; folder: string }) => Promise<void>;
  onRestore?: (versionId: string) => Promise<void>;
}

const COMMANDS = [
  { label: 'Insert outline', snippet: '## Overview\n1. Objective\n2. Inputs\n3. Outputs\n4. Guardrails' },
  { label: 'Add evaluation criteria', snippet: '### Evaluation Criteria\n- Metric:\n- Threshold:\n- Reviewer:' },
  { label: 'Add success checklist', snippet: '### Success Checklist\n- [ ] Clear persona\n- [ ] Explicit inputs\n- [ ] Explicit outputs' }
];

export function PromptEditor({
  promptId,
  title = '',
  body = '',
  tags = [],
  folder = 'Library',
  suggestions = [],
  folders = [],
  versions = [],
  onSubmit,
  onRestore
}: PromptEditorProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [localTitle, setLocalTitle] = useState(title);
  const [localBody, setLocalBody] = useState(body);
  const [localTags, setLocalTags] = useState(tags);
  const [localFolder, setLocalFolder] = useState(folder);
  const [commandOpen, setCommandOpen] = useState(false);
  const [optimizeResult, setOptimizeResult] = useState<{ optimized: string; rationale?: string } | null>(null);
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [optimizeSource, setOptimizeSource] = useState('');
  const [isPending, startTransition] = useTransition();

  const applyFormatting = useCallback((prefix: string, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const before = value.slice(0, selectionStart);
    const after = value.slice(selectionEnd);
    const newValue = `${before}${prefix}${selected || ''}${suffix}${after}`;
    setLocalBody(newValue);
    requestAnimationFrame(() => {
      const cursor = selectionEnd + prefix.length + suffix.length;
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }, []);

  const handleOptimize = async () => {
    if (!localBody) {
      toast.error('Add prompt content before optimizing.');
      return;
    }
    setOptimizeSource(localBody);
    setOptimizeOpen(true);
    setOptimizeResult(null);
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: localBody })
    });
    if (!response.ok) {
      setOptimizeOpen(false);
      toast.error('Failed to optimize prompt. Check OpenAI configuration.');
      return;
    }
    const data = await response.json();
    setOptimizeResult(data);
  };

  const handleSubmit = async () => {
    if (!localTitle.trim() || !localBody.trim()) {
      toast.error('Title and body are required.');
      return;
    }
    startTransition(async () => {
      await onSubmit({ title: localTitle.trim(), body_md: localBody.trim(), tags: localTags, folder: localFolder });
      toast.success('Prompt saved');
      router.push('/');
      router.refresh();
    });
  };

  const handleExport = (format: 'markdown' | 'json') => {
    if (format === 'markdown') {
      const blob = new Blob([localBody], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${localTitle || 'prompt'}.md`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as Markdown');
    } else {
      const payload = JSON.stringify({ title: localTitle, body: localBody, tags: localTags, folder: localFolder }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${localTitle || 'prompt'}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Exported as JSON');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(localBody);
    toast.success('Prompt copied to clipboard');
  };

  const handleInsertVersion = async (content: string) => {
    if (!promptId) {
      toast.error('Save the prompt before creating versions.');
      return;
    }
    const promise = createVersion({ prompt_id: promptId, body_md: content, notes: 'AI optimized variant' });
    toast.promise(promise, {
      loading: 'Saving version…',
      success: 'Version saved',
      error: 'Failed to save version'
    });
    await promise;
    router.refresh();
  };

  const commandItems = useMemo(() => COMMANDS, []);

  const applyCommand = (snippet: string) => {
    setLocalBody((value) => `${value}\n\n${snippet}`.trim());
    setCommandOpen(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to library
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
          <Button variant="outline" onClick={() => handleExport('markdown')}>
            <Download className="mr-2 h-4 w-4" /> Export MD
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="mr-2 h-4 w-4" /> Export JSON
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Save prompt
          </Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <Input
            value={localTitle}
            onChange={(event) => setLocalTitle(event.target.value)}
            placeholder="Prompt title"
            className="text-lg font-semibold"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => applyFormatting('# ', '')}>
              H1
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('## ', '')}>
              H2
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('### ', '')}>
              H3
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('**', '**')}>
              Bold
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('*', '*')}>
              Italic
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('`', '`')}>
              Inline code
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('```\n', '\n```')}>
              Code block
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('- ', '')}>
              List
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('- [ ] ', '')}>
              Checkbox
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('> ', '')}>
              Quote
            </Button>
            <Button size="sm" variant="outline" onClick={() => applyFormatting('[', '](url)')}>
              Link
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setCommandOpen(true)}>
              <ChevronDown className="mr-1 h-4 w-4" /> / commands
            </Button>
            <Button size="sm" onClick={handleOptimize}>
              <Sparkles className="mr-1 h-4 w-4" /> Optimize
            </Button>
          </div>
          <Textarea
            ref={textareaRef}
            value={localBody}
            onChange={(event) => setLocalBody(event.target.value)}
            className="min-h-[420px]"
            placeholder="Write your prompt in Markdown..."
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Live preview</h3>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} className="prose prose-sm dark:prose-invert max-w-none">
              {localBody || 'Start typing to see the preview.'}
            </ReactMarkdown>
          </div>
          <div className="space-y-4 rounded-lg border bg-card p-4">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Tags</h4>
              <TagPicker value={localTags} onChange={setLocalTags} suggestions={suggestions} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground">Folder</h4>
              <FolderPicker value={localFolder} onChange={setLocalFolder} options={folders} />
            </div>
          </div>
          {versions.length ? (
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <History className="h-4 w-4" /> Version history
              </div>
              <div className="space-y-2">
                {versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="text-sm font-medium">{version.notes ?? 'Snapshot'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(version.created_at).toLocaleString()}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (!onRestore) return;
                        const promise = onRestore(version.id);
                        toast.promise(promise, {
                          loading: 'Restoring version…',
                          success: 'Version restored',
                          error: 'Failed to restore version'
                        });
                      }}
                    >
                      <Undo2 className="mr-1 h-4 w-4" /> Restore
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <OptimizePanel
        original={optimizeSource}
        optimized={optimizeResult?.optimized ?? ''}
        rationale={optimizeResult?.rationale}
        open={optimizeOpen && Boolean(optimizeResult)}
        onClose={() => setOptimizeOpen(false)}
        onReplace={() => {
          if (optimizeResult?.optimized) {
            setLocalBody(optimizeResult.optimized);
            setOptimizeOpen(false);
            toast.success('Prompt replaced with optimized version');
          }
        }}
        onCreateVersion={async () => {
          if (optimizeResult?.optimized) {
            await handleInsertVersion(optimizeResult.optimized);
            toast.success('Optimized version saved');
            setOptimizeOpen(false);
          }
        }}
      />
      {commandOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/70 p-6 backdrop-blur-sm"
          onClick={() => setCommandOpen(false)}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-lg border bg-card shadow-xl" onClick={(event) => event.stopPropagation()}>
            <Command>
              <CommandInput placeholder="Search commands" />
              <CommandList>
                <CommandGroup heading="Snippets">
                  {commandItems.map((item) => (
                    <CommandItem key={item.label} onSelect={() => applyCommand(item.snippet)}>
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </div>
  );
}
