"use client";

import { Vinyl } from "@/components/ui/Vinyl";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

interface AudioDeckProps {
  previewUrl: string | null;
  hasTrack: boolean;
  onSkip?: () => void;
}

function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;

  return `0:${String(Math.floor(safe)).padStart(2, "0")}`;
}

export function AudioDeck({ previewUrl, hasTrack, onSkip }: AudioDeckProps) {
  const player = useAudioPlayer(previewUrl);
  const progress = player.duration > 0 ? Math.min(100, (player.elapsed / player.duration) * 100) : 0;

  const label = !hasTrack
    ? "Nada tocando"
    : !previewUrl
      ? "Procurando o som..."
      : player.playing
        ? "Tocando"
        : "Pausado";

  return (
    <div className="edge-card rounded-3xl border-2 border-ink bg-ink p-4 text-sun sm:p-5">
      <div className="flex items-center gap-4">
        <Vinyl spinning={player.playing} className="w-16 shrink-0 sm:w-20" />

        <div className="min-w-0 flex-1">
          <span className="display block text-base">{label}</span>
          <span className="mt-0.5 block text-xs text-cream/55">
            {!hasTrack
              ? "Quando for sua vez, toque a próxima música"
              : !previewUrl
                ? "Buscando a faixa no acervo"
                : "Ouça quantas vezes quiser antes de cravar"}
          </span>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream/15">
            <div
              className="h-full rounded-full bg-magenta"
              style={{ width: `${progress}%`, transition: "width 250ms linear" }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[0.65rem] font-semibold text-cream/45">
            <span>{formatTime(player.elapsed)}</span>
            <span>{formatTime(player.duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={player.toggle}
          disabled={!previewUrl}
          className="display flex-1 cursor-pointer rounded-2xl bg-sun px-4 py-3 text-ink transition-all duration-150 hover:-translate-y-[2px] hover:bg-sun-light disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
        >
          {player.playing ? "Pausar" : "Tocar"}
        </button>
        <button
          type="button"
          onClick={player.restart}
          disabled={!previewUrl}
          className="display cursor-pointer rounded-2xl bg-cream/12 px-4 py-3 text-sun ring-2 ring-inset ring-cream/25 transition-all duration-150 hover:-translate-y-[2px] hover:bg-cream/20 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
        >
          Do início
        </button>
      </div>

      {player.blocked && previewUrl ? (
        <p className="mt-3 rounded-xl bg-magenta px-3 py-2 text-center text-xs font-semibold text-cream">
          O navegador bloqueou o som. Aperte Tocar.
        </p>
      ) : null}

      {hasTrack && !previewUrl && onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className="display mt-3 w-full cursor-pointer rounded-xl bg-cream/10 px-3 py-2 text-xs text-sun ring-2 ring-inset ring-cream/20 transition-colors hover:bg-cream/20"
        >
          Não achei essa faixa — pular
        </button>
      ) : null}
    </div>
  );
}
