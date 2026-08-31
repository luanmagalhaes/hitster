type WordmarkSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<WordmarkSize, string> = {
  sm: "text-lg",
  md: "text-3xl",
  lg: "text-5xl sm:text-6xl",
  xl: "text-6xl sm:text-7xl lg:text-8xl",
};

interface WordmarkProps {
  size?: WordmarkSize;
  className?: string;
}

export function Wordmark({ size = "md", className = "" }: WordmarkProps) {
  return (
    <span className={`display inline-block select-none text-ink ${sizeClasses[size]} ${className}`}>
      Vitrola
    </span>
  );
}
