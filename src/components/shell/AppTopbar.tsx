'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/db';
import { useTheme } from 'next-themes';
import { MoonStar, Plus, Search, Sun } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';

interface AppTopbarProps {
  prompts: { id: string; title: string; tags: string[] }[];
  userEmail?: string;
}

export function AppTopbar({ prompts, userEmail }: AppTopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClientComponentClient<Database>(), []);
  const [commandOpen, setCommandOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateQuery = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router, searchParams]
  );

  useHotkeys('/', (event) => {
    const target = event.target as HTMLElement;
    if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
      return;
    }
    event.preventDefault();
    setCommandOpen(true);
  });

  useHotkeys('mod+k', (event) => {
    event.preventDefault();
    setCommandOpen((prev) => !prev);
  });

  const initials = userEmail?.slice(0, 2).toUpperCase() ?? 'AI';

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      router.refresh();
    }
  }, [router, supabase]);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex flex-1 items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              updateQuery((event.target as HTMLInputElement).value);
            }
          }}
          placeholder="Search prompts or press /"
          className="max-w-md"
        />
        <Button variant="ghost" onClick={() => updateQuery(query)} className="hidden md:inline-flex">
          Apply
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/prompts/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Prompt
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">{userEmail ?? 'Anonymous'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setCommandOpen(true)}>Command palette</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              Toggle theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {commandOpen && (
        <div
          className={cn(
            'fixed inset-0 z-50 flex items-start justify-center bg-background/60 backdrop-blur-sm p-4',
            commandOpen ? 'animate-in fade-in-0' : 'animate-out fade-out-0'
          )}
          role="dialog"
          aria-modal="true"
          onClick={() => setCommandOpen(false)}
        >
          <div className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
            <Command className="border shadow-xl">
              <CommandInput placeholder="Search prompts, go to prompt..." />
              <CommandList>
                <CommandEmpty>No prompts found.</CommandEmpty>
                <CommandGroup heading="Prompts">
                  {prompts.map((prompt) => (
                    <CommandItem
                      key={prompt.id}
                      value={`${prompt.title} ${prompt.tags.join(' ')}`}
                      onSelect={() => {
                        setCommandOpen(false);
                        router.push(`/prompts/${prompt.id}`);
                      }}
                    >
                      {prompt.title}
                      {prompt.tags.length ? (
                        <span className="ml-auto text-xs text-muted-foreground">{prompt.tags.join(', ')}</span>
                      ) : null}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </header>
  );
}
