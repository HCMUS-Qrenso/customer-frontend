'use client';

import { Button } from '@/components/ui/button';
import { CategoryDTO } from '@/lib/types/menu';
import { Language } from '@/lib/i18n/translations';

interface CategoryChipsProps {
  categories: CategoryDTO[];
  selectedCategory: string | null;
  onSelect: (categoryId: string | null) => void;
  allLabel: string;
  language: Language;
}

export function CategoryChips({ 
  categories, 
  selectedCategory, 
  onSelect, 
  allLabel, 
  language 
}: CategoryChipsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-3 no-scrollbar scroll-smooth md:px-6">
      <Button
        variant={selectedCategory === null ? 'default' : 'secondary'}
        size="sm"
        onClick={() => onSelect(null)}
        className={`h-9 shrink-0 rounded-full px-5 transition-transform active:scale-95 ${
          selectedCategory === null
            ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md hover:bg-emerald-600'
            : 'bg-slate-800 text-slate-200 font-medium hover:bg-slate-700'
        }`}
      >
        {allLabel}
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onSelect(category.id)}
          className={`h-9 shrink-0 rounded-full px-5 transition-transform active:scale-95 ${
            selectedCategory === category.id
              ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md hover:bg-emerald-600'
              : 'bg-slate-800 text-slate-200 font-medium hover:bg-slate-700'
          }`}
        >
          {language === 'en' && category.nameEn ? category.nameEn : category.name}
        </Button>
      ))}
    </div>
  );
}
