"use client";

import { Button } from "@/components/ui/Button";
import { Vinyl } from "@/components/ui/Vinyl";
import type { SharedResult } from "@/types/room";
import { tokens } from "@/utils/plural";

interface ResultModalProps {
  result: SharedResult;
  isMe: boolean;
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

export function ResultModal({ result, isMe, onClose }: ResultModalProps) {
  const tried = result.artistTried || result.titleTried;
  const score = (result.correct ? 1 : 0) + result.earnedTokens;
  const who = isMe ? "Você" : result.playerName;
  const put = isMe ? "Você pôs" : `${result.playerName} pôs`;
  const guessed = isMe ? "Você chutou" : "Chutou";

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
              {result.correct ? `${who} acertou!` : `${who} errou`}
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
                ? `${put} ${result.chosenLabel} e é isso mesmo.`
                : `${put} ${result.chosenLabel}, mas ${result.track.year} fica ${result.correctLabel}.`
            }
          />

          {result.artistTried ? (
            <Line
              hit={result.artistHit}
              label={result.artistHit ? "Artista certo" : "Artista errado"}
              detail={
                result.artistHit
                  ? `Era ${result.track.artist} mesmo.`
                  : `${guessed} outro nome. Era ${result.track.artist}.`
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
                  : `${guessed} outro nome. Era ${result.track.title}.`
              }
            />
          ) : null}

          {result.earnedTokens > 0 ? (
            <li className="animate-winner-stamp overflow-hidden rounded-2xl border-2 border-ink bg-magenta text-center">
              <div className="bg-magenta px-3 py-4 text-cream">
                <span className="display block text-xs uppercase tracking-[0.2em] opacity-75">
                  {result.earnedTokens === 2 ? "Dobrou a aposta" : "Ganhou ficha"}
                </span>
                <span className="mt-2 flex items-center justify-center gap-2">
                  {Array.from({ length: result.earnedTokens }, (_, slot) => (
                    <span
                      key={slot}
                      className="display flex h-11 w-11 items-center justify-center rounded-full border-2 border-cream bg-sun text-lg text-ink"
                    >
                      ★
                    </span>
                  ))}
                </span>
                <span className="display mt-2 block text-2xl">+{tokens(result.earnedTokens)}</span>
              </div>
              <span className="block bg-paper px-3 py-2 text-xs font-semibold leading-snug text-ink/75">
                {result.bonusReason}
              </span>
            </li>
          ) : result.bonusReason ? (
            <li className="rounded-2xl border-2 border-ink bg-paper p-3 text-center">
              <span className="block text-xs font-semibold leading-snug text-ink/75">
                {result.bonusReason}
              </span>
            </li>
          ) : null}

          {!tried ? (
            <li className="rounded-2xl border-2 border-dashed border-ink/35 p-3 text-center text-xs font-semibold text-ink/55">
              {isMe
                ? "Da próxima, tente cravar artista e música também: vale ficha."
                : "Não tentou cravar artista nem música dessa vez."}
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
