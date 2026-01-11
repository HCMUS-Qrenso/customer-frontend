"use client";

import Image from "next/image";
import { useLanguage, Language } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LANGUAGE_CONFIG: Record<Language, { flag: string; label: string }> = {
  vi: { flag: "/vietnam.png", label: "Tiếng Việt" },
  en: { flag: "/united-kingdom.png", label: "English" },
  fr: { flag: "/france.png", label: "Français" },
  zh: { flag: "/china.png", label: "中文" },
};

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  const currentConfig = LANGUAGE_CONFIG[lang];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-10 rounded-full transition-colors",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            className,
          )}
          title={currentConfig.label}
        >
          <Image
            src={currentConfig.flag}
            alt={currentConfig.label}
            width={24}
            height={24}
            className="size-6 rounded-sm object-cover"
          />
          <span className="sr-only">{currentConfig.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {(Object.keys(LANGUAGE_CONFIG) as Language[]).map((langKey) => {
          const config = LANGUAGE_CONFIG[langKey];
          return (
            <DropdownMenuItem
              key={langKey}
              onClick={() => setLang(langKey)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                lang === langKey && "bg-slate-100 dark:bg-slate-800",
              )}
            >
              <Image
                src={config.flag}
                alt={config.label}
                width={20}
                height={20}
                className="size-5 rounded-sm object-cover"
              />
              <span>{config.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
