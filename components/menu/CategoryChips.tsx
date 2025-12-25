"use client";

import { Button } from "@/components/ui/button";

interface CategoryChipsProps {
  categories: { id: string; name: string }[];
  selectedCategory: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryChips({
  categories,
  selectedCategory,
  onSelect,
}: CategoryChipsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-3 no-scrollbar scroll-smooth md:px-6">
      <Button
        variant={selectedCategory === null ? "default" : "secondary"}
        size="sm"
        onClick={() => onSelect(null)}
        className={`h-9 shrink-0 rounded-full px-5 transition-transform active:scale-95 ${
          selectedCategory === null
            ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600"
            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-transparent"
        }`}
      >
        Tất cả
      </Button>

      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "secondary"}
          size="sm"
          onClick={() => onSelect(category.id)}
          className={`h-9 shrink-0 rounded-full px-5 transition-transform active:scale-95 ${
            selectedCategory === category.id
              ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-transparent"
          }`}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
