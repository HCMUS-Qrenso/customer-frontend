"use client";

interface MobileStickyBarProps {
  /** Content to render inside the sticky bar */
  children: React.ReactNode;
  /** Additional className for customization */
  className?: string;
  /** Max width class for the inner container */
  maxWidth?: "sm" | "md" | "lg" | "2xl" | "6xl" | "7xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  "2xl": "max-w-2xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export function MobileStickyBar({
  children,
  className,
  maxWidth = "lg",
}: MobileStickyBarProps) {
  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700/50 p-4 pb-[calc(env(safe-area-inset-bottom,16px)+16px)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] ${className || ""}`}
    >
      <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>{children}</div>
    </div>
  );
}
