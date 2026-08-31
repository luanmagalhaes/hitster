"use client";

import { Vinyl } from "@/components/ui/Vinyl";

const pieces = [
  { left: 6, delay: 0, color: "var(--color-magenta)", size: 11 },
  { left: 16, delay: 340, color: "var(--color-aqua)", size: 8 },
  { left: 27, delay: 120, color: "var(--color-ink)", size: 13 },
  { left: 38, delay: 560, color: "var(--color-magenta-soft)", size: 9 },
  { left: 48, delay: 220, color: "var(--color-aqua-soft)", size: 12 },
  { left: 59, delay: 720, color: "var(--color-ink)", size: 10 },
  { left: 69, delay: 60, color: "var(--color-magenta)", size: 14 },
  { left: 79, delay: 440, color: "var(--color-aqua)", size: 9 },
  { left: 89, delay: 260, color: "var(--color-magenta-soft)", size: 11 },
  { left: 96, delay: 640, color: "var(--color-ink)", size: 8 },
];

interface WinnerBurstProps {
  name: string;
  isMe: boolean;
}

export function WinnerBurst({ name, isMe }: WinnerBurstProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.left}
          className="animate-confetti absolute top-0 rounded-sm"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size * 1.6,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}ms`,
          }}
        />
      ))}

      <div className="relative flex h-full flex-col items-center justify-center gap-4">
        <div className="animate-winner-vinyl">
          <Vinyl className="w-40 sm:w-52" />
        </div>

        <div className="animate-winner-stamp">
          <span className="display block rounded-2xl border-4 border-ink bg-sun px-6 py-3 text-4xl text-ink shadow-[0_8px_0_var(--color-ink)] sm:text-5xl">
            {isMe ? "Você ganhou!" : "Ganhou!"}
          </span>
        </div>

        <span className="display animate-winner-stamp text-lg text-ink/70">{name}</span>
      </div>
    </div>
  );
}
