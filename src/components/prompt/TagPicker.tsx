'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
}

export function TagPicker({ value, onChange, suggestions = [] }: TagPickerProps) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (!normalized) return;
    if (value.includes(normalized)) return;
    onChange([...value, normalized]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((existing) => existing !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1 capitalize">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="rounded-full p-0.5 hover:bg-primary/20">
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag}</span>
            </button>
          </Badge>
        ))}
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              addTag(input);
            }
          }}
          placeholder="Add tag and press Enter"
          className="max-w-[200px]"
        />
      </div>
      {suggestions.length ? (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {suggestions.map((tag) => (
            <Button key={tag} type="button" variant="ghost" size="sm" onClick={() => addTag(tag)}>
              #{tag}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
