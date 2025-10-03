import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2, Copy } from 'lucide-react';
import { type Prompt } from '@/types';

interface PromptCardProps {
  prompt: Prompt;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PromptCard({ prompt, onDuplicate, onDelete }: PromptCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="line-clamp-2 text-lg font-semibold">
            <Link href={`/prompts/${prompt.id}`} className="hover:underline">
              {prompt.title}
            </Link>
          </CardTitle>
          <p className="text-xs text-muted-foreground">Updated {formatDistanceToNow(new Date(prompt.updated_at))} ago</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <Link href={`/prompts/${prompt.id}`} className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(prompt.id)} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(prompt.id)} className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="line-clamp-3 text-sm text-muted-foreground">{prompt.body_md}</p>
        <div className="flex flex-wrap gap-1">
          {prompt.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="capitalize">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={`/prompts/${prompt.id}`}>
            <Pencil className="h-4 w-4" />
            Open
          </Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDuplicate(prompt.id)} className="gap-2">
          <Copy className="h-4 w-4" />
          Duplicate
        </Button>
      </CardFooter>
    </Card>
  );
}
