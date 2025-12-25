"use client";

interface LiveIndicatorProps {
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "size-2.5",
  md: "h-3 w-3",
};

/**
 * Animated ping indicator for live/active status
 */
export function LiveIndicator({
  size = "sm",
  className = "",
}: LiveIndicatorProps) {
  return (
    <span className={`relative flex ${sizeClasses[size]} ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
      <span
        className={`relative inline-flex ${sizeClasses[size]} rounded-full bg-emerald-500`}
      />
    </span>
  );
}
