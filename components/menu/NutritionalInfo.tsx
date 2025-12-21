'use client';

import { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

interface NutritionalInfoProps {
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  title?: string;
}

/**
 * Collapsible accordion showing nutritional information
 */
export function NutritionalInfo({ nutritionalInfo, title = 'Thông tin dinh dưỡng' }: NutritionalInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if no nutritional info
  if (!nutritionalInfo) return null;
  
  const hasAnyInfo = nutritionalInfo.calories || nutritionalInfo.protein || 
                     nutritionalInfo.carbs || nutritionalInfo.fat;
  
  if (!hasAnyInfo) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
      >
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Info className="size-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronDown className={`size-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-40' : 'max-h-0'}`}>
        <div className="flex flex-wrap gap-2 p-3">
          {nutritionalInfo.calories && (
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-orange-500/10 px-3 text-orange-600 dark:text-orange-400">
              <span className="text-xs font-bold">{nutritionalInfo.calories}</span>
              <span className="text-xs">kcal</span>
            </div>
          )}
          {nutritionalInfo.protein && (
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-red-500/10 px-3 text-red-600 dark:text-red-400">
              <span className="text-xs font-bold">{nutritionalInfo.protein}g</span>
              <span className="text-xs">protein</span>
            </div>
          )}
          {nutritionalInfo.carbs && (
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-blue-500/10 px-3 text-blue-600 dark:text-blue-400">
              <span className="text-xs font-bold">{nutritionalInfo.carbs}g</span>
              <span className="text-xs">carbs</span>
            </div>
          )}
          {nutritionalInfo.fat && (
            <div className="flex h-7 items-center gap-1.5 rounded-full bg-yellow-500/10 px-3 text-yellow-600 dark:text-yellow-400">
              <span className="text-xs font-bold">{nutritionalInfo.fat}g</span>
              <span className="text-xs">fat</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
