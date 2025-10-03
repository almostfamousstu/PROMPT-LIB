'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Folder, Hash } from 'lucide-react';

interface AppSidebarProps {
  folders: string[];
  tags: string[];
}

export function AppSidebar({ folders, tags }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFolder = searchParams.get('folder');
  const activeTag = searchParams.get('tag');

  const baseParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const setParam = (key: string, value?: string | null) => {
    const params = new URLSearchParams(baseParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-muted/20">
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Folders</h2>
      </div>
      <ScrollArea className="h-48 px-2">
        <nav className="flex flex-col gap-1 pb-4">
          <Button
            variant={activeFolder ? 'ghost' : 'secondary'}
            className={cn('justify-start gap-2', !activeFolder && 'bg-secondary/80')}
            onClick={() => setParam('folder', null)}
          >
            <Folder className="h-4 w-4" />
            Library
          </Button>
          {folders.map((folder) => (
            <Button
              key={folder}
              variant={activeFolder === folder ? 'secondary' : 'ghost'}
              className={cn('justify-start gap-2', activeFolder === folder && 'bg-secondary/80')}
              onClick={() => setParam('folder', folder)}
            >
              <Folder className="h-4 w-4" />
              {folder}
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="px-4 py-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Tags</h2>
      </div>
      <ScrollArea className="flex-1 px-2 pb-6">
        <nav className="flex flex-col gap-1">
          <Button
            variant={activeTag ? 'ghost' : 'secondary'}
            className={cn('justify-start gap-2', !activeTag && 'bg-secondary/80')}
            onClick={() => setParam('tag', null)}
          >
            <Hash className="h-4 w-4" />
            All tags
          </Button>
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? 'secondary' : 'ghost'}
              className={cn('justify-start gap-2 capitalize', activeTag === tag && 'bg-secondary/80')}
              onClick={() => setParam('tag', tag)}
            >
              <Hash className="h-4 w-4" />
              {tag}
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t p-4">
        <Button variant="outline" asChild className="w-full">
          <Link href="/playground">Playground</Link>
        </Button>
      </div>
    </aside>
  );
}
