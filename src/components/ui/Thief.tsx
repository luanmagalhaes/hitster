interface ThiefProps {
  className?: string;
  winking?: boolean;
}

export function Thief({ className = "", winking = false }: ThiefProps) {
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label="Ladrãozinho">
      <circle cx="48" cy="52" r="34" fill="var(--color-cream)" stroke="var(--color-ink)" strokeWidth="5" />
      <path
        d="M14 40c4-18 18-28 34-28s30 10 34 28c-10-6-20-4-34-4s-24-2-34 4z"
        fill="var(--color-ink)"
      />
      <rect x="15" y="36" width="66" height="7" rx="3.5" fill="var(--color-ink)" />
      <rect x="17" y="46" width="62" height="15" rx="7.5" fill="var(--color-ink)" />
      <circle cx="35" cy="53" r="4.6" fill="var(--color-cream)" />
      {winking ? (
        <rect x="55" y="51" width="10" height="4" rx="2" fill="var(--color-cream)" />
      ) : (
        <circle cx="61" cy="53" r="4.6" fill="var(--color-cream)" />
      )}
      <path
        d="M36 70c4 5 9 7 12 7s8-2 12-7"
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="78" cy="76" r="15" fill="var(--color-ink)" stroke="var(--color-cream)" strokeWidth="3" />
      <circle cx="78" cy="76" r="5" fill="var(--color-magenta)" />
      <circle cx="78" cy="76" r="1.6" fill="var(--color-cream)" />
    </svg>
  );
}
