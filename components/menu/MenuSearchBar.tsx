"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ArrowUpDown, X, Check } from "lucide-react";

// Sort options
const SORT_OPTIONS = [
  {
    value: "popularityScore_desc",
    label: "Phổ biến nhất",
    sortBy: "popularityScore",
    sortOrder: "desc" as const,
  },
  {
    value: "createdAt_desc",
    label: "Mới nhất",
    sortBy: "createdAt",
    sortOrder: "desc" as const,
  },
  {
    value: "basePrice_asc",
    label: "Giá: Thấp → Cao",
    sortBy: "basePrice",
    sortOrder: "asc" as const,
  },
  {
    value: "basePrice_desc",
    label: "Giá: Cao → Thấp",
    sortBy: "basePrice",
    sortOrder: "desc" as const,
  },
  {
    value: "name_asc",
    label: "Tên A-Z",
    sortBy: "name",
    sortOrder: "asc" as const,
  },
];

interface MenuSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
}

export function MenuSearchBar({
  value,
  onChange,
  placeholder,
  sortBy,
  sortOrder,
  onSortChange,
}: MenuSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSort = `${sortBy}_${sortOrder}`;
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === currentSort)?.label || "Sắp xếp";
  const isDefaultSort = sortBy === "popularityScore" && sortOrder === "desc";

  return (
    <div className="px-4 pb-3 md:px-6">
      <div className="flex h-12 w-full items-stretch gap-2">
        {/* Search Input */}
        <div className="flex flex-1 items-stretch rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-transparent shadow-sm">
          <div className="flex items-center justify-center pl-4 text-slate-400">
            <Search className="size-5" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex h-full w-full min-w-0 flex-1 border-none bg-transparent px-3 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {value && (
            <button
              onClick={() => onChange("")}
              className="mr-2 flex items-center justify-center rounded-full p-1.5 text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Sort Filter Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex h-12 items-center gap-2 rounded-xl px-3 transition-colors border ${
              isOpen || !isDefaultSort
                ? "bg-emerald-500 text-white border-emerald-500"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 border-gray-100 dark:border-transparent shadow-sm"
            }`}
          >
            <ArrowUpDown className="size-5" />
            <span className="hidden text-sm font-medium sm:inline">
              {currentLabel}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl">
              <div className="p-2 space-y-1">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.sortBy, option.sortOrder);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      currentSort === option.value
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{option.label}</span>
                    {currentSort === option.value && (
                      <Check className="size-4" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
