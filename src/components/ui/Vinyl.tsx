interface VinylProps {
  spinning?: boolean;
  className?: string;
  label?: string;
}

export function Vinyl({ spinning = false, className = "", label }: VinylProps) {
  return (
    <div className={`gpu relative aspect-square ${className}`}>
      <div
        className={`absolute inset-0 rounded-full bg-ink shadow-[0_18px_36px_-14px_rgba(16,16,20,0.7)] ${
          spinning ? "animate-vinyl-spin" : ""
        }`}
      >
        <div className="absolute inset-[7%] rounded-full border border-white/10" />
        <div className="absolute inset-[15%] rounded-full border border-white/10" />
        <div className="absolute inset-[24%] rounded-full border border-white/10" />
        <div className="absolute inset-[33%] rounded-full border border-white/10" />
        <div className="absolute inset-[38%] rounded-full bg-magenta" />
        <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-white/25 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[6%] w-[6%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream" />
      </div>

      {label ? (
        <span className="display absolute inset-0 flex items-center justify-center text-center text-[0.6rem] text-cream/90">
          {label}
        </span>
      ) : null}
    </div>
  );
}
