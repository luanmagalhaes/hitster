"use client";

import { Button } from "@/components/ui/Button";
import { Vinyl } from "@/components/ui/Vinyl";
import type { GuessResult } from "@/lib/api";

interface ResultModalProps {
  result: GuessResult;
  playerName: string;
  onClose: () => void;
}

interface LineProps {
  hit: boolean;
  label: string;
  detail: string;
}

function Line({ hit, label, detail }: LineProps) {
  return (
    <li
      className={`flex items-start gap-3 rounded-2xl border-2 border-ink p-3 ${
        hit ? "bg-aqua" : "bg-magenta-soft"
      }`}
    >
      <span
        className={`display flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base ${
          hit ? "bg-ink text-aqua" : "bg-ink text-magenta-soft"
        }`}
      >
        {hit ? "✓" : "✗"}
      </span>
      <span className="min-w-0 flex-1">
        <span className="display block text-sm text-ink">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-ink/75">{detail}</span>
      </span>
    </li>
  );
}

export function ResultModal({ result, playerName, onClose }: ResultModalProps) {
  const tried = result.artistTried || result.titleTried;
  const score = (result.correct ? 1 : 0) + (result.earnedTokens > 0 ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div className="animate-sleeve-slide w-full max-w-md overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div
          className={`relative flex items-center gap-4 p-5 ${
            result.correct ? "bg-aqua" : "bg-magenta"
          } ${result.correct ? "text-ink" : "text-cream"}`}
        >
          <Vinyl spinning={result.correct} className="w-16 shrink-0" />
          <div className="min-w-0">
            <span className="display block text-2xl leading-tight">
              {result.correct ? `${playerName} acertou!` : `${playerName} errou`}
            </span>
            <span className="mt-1 block text-sm opacity-85">
              {result.correct
                ? score > 1
                  ? "Posição e aposta, tudo certo"
                  : "A carta é sua"
                : "A carta volta pro monte"}
            </span>
          </div>
        </div>

        <div className="border-b-4 border-ink bg-sun-light px-5 py-4 text-center">
          <span className="display block text-xs uppercase tracking-[0.2em] text-ink/55">
            A música era
          </span>
          <span className="display mt-1 block text-lg leading-tight text-ink">
            {result.track.artist}
          </span>
          <span className="block text-sm text-ink/70">{result.track.title}</span>
          <span className="display mt-2 block text-5xl leading-none text-ink">
            {result.track.year}
          </span>
        </div>

        <ul className="flex flex-col gap-2 p-5">
          <Line
            hit={result.correct}
            label={result.correct ? "Posição certa" : "Posição errada"}
            detail={
              result.correct
                ? `Você pôs ${result.chosenLabel} e é isso mesmo.`
                : `Você pôs ${result.chosenLabel}, mas ${result.track.year} fica ${result.correctLabel}.`
            }
          />

          {result.artistTried ? (
            <Line
              hit={result.artistHit}
              label={result.artistHit ? "Artista certo" : "Artista errado"}
              detail={
                result.artistHit
                  ? `Era ${result.track.artist} mesmo.`
                  : `Você chutou outro nome. Era ${result.track.artist}.`
              }
            />
          ) : null}

          {result.titleTried ? (
            <Line
              hit={result.titleHit}
              label={result.titleHit ? "Música certa" : "Música errada"}
              detail={
                result.titleHit
                  ? `Era ${result.track.title} mesmo.`
                  : `Você chutou outro nome. Era ${result.track.title}.`
              }
            />
          ) : null}

          {result.bonusReason ? (
            <li
              className={`rounded-2xl border-2 border-ink p-3 text-center ${
                result.earnedTokens > 0 ? "bg-aqua" : "bg-paper"
              }`}
            >
              {result.earnedTokens > 0 ? (
                <span className="display flex items-center justify-center gap-2 text-lg text-ink">
                  <span className="h-4 w-4 rounded-full bg-magenta" />+{result.earnedTokens} ficha
                </span>
              ) : null}
              <span className="mt-1 block text-xs font-semibold leading-snug text-ink/75">
                {result.bonusReason}
              </span>
            </li>
          ) : null}

          {!tried ? (
            <li className="rounded-2xl border-2 border-dashed border-ink/35 p-3 text-center text-xs font-semibold text-ink/55">
              Da próxima, tente cravar artista e música também: vale ficha.
            </li>
          ) : null}
        </ul>

        <div className="px-5 pb-5">
          <Button variant="ink" size="lg" fullWidth onClick={onClose}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
