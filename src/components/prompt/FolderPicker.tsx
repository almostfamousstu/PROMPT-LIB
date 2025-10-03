'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FolderPlus } from 'lucide-react';

interface FolderPickerProps {
  value: string;
  onChange: (folder: string) => void;
  options: string[];
}

export function FolderPicker({ value, onChange, options }: FolderPickerProps) {
  const [custom, setCustom] = useState('');

  const addCustomFolder = () => {
    const trimmed = custom.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setCustom('');
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <FolderPlus className="h-4 w-4" />
            {value || 'Select folder'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onChange('Library')}>Library</DropdownMenuItem>
          {options.map((option) => (
            <DropdownMenuItem key={option} onClick={() => onChange(option)}>
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Input
        placeholder="New folder"
        value={custom}
        onChange={(event) => setCustom(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            addCustomFolder();
          }
        }}
        className="max-w-[180px]"
      />
      <Button type="button" variant="secondary" onClick={addCustomFolder} disabled={!custom.trim()}>
        Add
      </Button>
    </div>
  );
}
