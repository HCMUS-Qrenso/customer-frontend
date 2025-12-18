'use client';

import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function MenuSearchBar({ value, onChange, placeholder }: MenuSearchBarProps) {
  return (
    <div className="px-4 pb-3 md:px-6">
      <div className="flex h-12 w-full items-stretch rounded-xl bg-slate-800">
        <div className="flex items-center justify-center pl-4 text-slate-400">
          <Search className="size-5" />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex h-full w-full min-w-0 flex-1 border-none bg-transparent px-3 text-base text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onChange('')}
            className="mr-2 size-8 self-center rounded-full text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
