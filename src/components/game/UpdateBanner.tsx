"use client";

interface UpdateBannerProps {
  onReload: () => void;
}

export function UpdateBanner({ onReload }: UpdateBannerProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] p-3">
      <button
        type="button"
        onClick={onReload}
        className="animate-sleeve-slide mx-auto flex w-full max-w-md cursor-pointer items-center gap-3 rounded-2xl border-2 border-ink bg-magenta px-4 py-3 text-left text-cream shadow-[0_5px_0_var(--color-ink)] transition-transform duration-150 hover:-translate-y-[2px]"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-lg text-magenta">
          ↻
        </span>
        <span className="min-w-0 flex-1">
          <span className="display block text-sm leading-tight">Tem novidade no jogo</span>
          <span className="block text-xs opacity-85">
            Atualizando em instantes — toque para já
          </span>
        </span>
      </button>
    </div>
  );
}
