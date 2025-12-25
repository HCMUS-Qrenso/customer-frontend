"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  // Cycle through languages: vi → en → vi
  const cycleLanguage = () => {
    setLang(lang === "vi" ? "en" : "vi");
  };

  const getFlag = () => {
    return lang === "vi" ? "/vietnam.png" : "/united-kingdom.png";
  };

  const getLabel = () => {
    return lang === "vi" ? "Tiếng Việt" : "English";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleLanguage}
      className={cn(
        "size-10 rounded-full transition-colors",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        className,
      )}
      title={getLabel()}
    >
      <Image
        src={getFlag()}
        alt={getLabel()}
        width={24}
        height={24}
        className="size-6 rounded-sm object-cover"
      />
      <span className="sr-only">{getLabel()}</span>
    </Button>
  );
}
