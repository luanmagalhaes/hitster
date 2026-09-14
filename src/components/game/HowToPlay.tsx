"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Vinyl } from "@/components/ui/Vinyl";
import { brand } from "@/data/copy";

interface HowToPlayProps {
  onClose: () => void;
}

function Hit({ children }: { children: ReactNode }) {
  return <strong className="display font-semibold text-aqua">{children}</strong>;
}

function Coin({ children }: { children: ReactNode }) {
  return <strong className="display font-semibold text-magenta">{children}</strong>;
}

function Risk({ children }: { children: ReactNode }) {
  return (
    <strong className="display font-semibold text-magenta underline decoration-magenta/40 decoration-2 underline-offset-2">
      {children}
    </strong>
  );
}

interface Slide {
  title: string;
  tone: string;
  art: "stack" | "coin" | "steal";
  body: ReactNode;
}

const slides: Slide[] = [
  {
    title: "Presta atenção, benção!",
    tone: "stage-sun text-ink",
    art: "stack",
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-base leading-snug text-ink/80">
          {brand.name} não pede o nome da música. Pede o <Hit>ano</Hit>.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-sun-light p-3">
          <p className="text-sm leading-snug text-ink/80">Toca um trecho e você decide</p>
          <p className="display mt-1 text-lg leading-tight text-ink">
            onde ela entra na sua linha do tempo
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Antes de 1994? Entre 1994 e 2008? Depois de 2008?
          <br />
          Você não precisa saber o ano exato, só a <Hit>posição certa</Hit>.
        </p>
      </div>
    ),
  },
  {
    title: "Acertou, a carta é sua",
    tone: "bg-aqua text-ink",
    art: "coin",
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          Posição certa e a música <Hit>entra na sua linha</Hit>. Errou, ela volta pro monte.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-sun-light p-3">
          <p className="text-sm leading-snug text-ink/80">Quer arriscar mais? Chute também</p>
          <p className="display mt-1 text-lg leading-tight text-magenta">artista e música</p>
          <p className="mt-1 text-xs font-semibold text-ink/70">
            Cada acerto vale <Coin>1 ficha</Coin>. Os dois valem <Coin>2</Coin>.
          </p>
        </div>
        <p className="text-sm leading-snug text-ink/75">
          Fichas compram carta de graça. Quanto mais cartas, <Hit>mais apertado fica</Hit> — cada
          uma cria um intervalo novo e menor.
        </p>
      </div>
    ),
  },
  {
    title: "Demorou? Roubam de você",
    tone: "bg-magenta text-cream",
    art: "steal",
    body: (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm leading-snug text-ink/75">
          O trecho dura 30 segundos. Passou disso sem responder, qualquer um da mesa pode{" "}
          <Risk>roubar a música</Risk>.
        </p>
        <div className="rounded-2xl border-2 border-ink bg-magenta-soft p-3">
          <p className="display text-lg leading-tight text-ink">Roubar também é risco</p>
          <p className="mt-1 text-xs font-semibold text-ink/75">
            Acertou, leva a carta como se fosse a vez dela.
            <br />
            Errou, devolve <Risk>uma carta sua</Risk> pro monte.
          </p>
        </div>
        <div className="rounded-2xl border-4 border-ink bg-paper p-3">
          <p className="display text-lg leading-tight text-ink">Vence quem primeiro</p>
          <p className="display text-2xl leading-tight text-magenta">completa a linha</p>
        </div>
      </div>
    ),
  },
];

export function HowToPlay({ onClose }: HowToPlayProps) {
  const [step, setStep] = useState(0);
  const slide = slides[step];
  const last = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[62] flex items-end justify-center bg-ink/80 p-4 sm:items-center">
      <div className="animate-sleeve-slide flex max-h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className={`shrink-0 px-5 pb-4 pt-5 text-center ${slide.tone}`}>
          <div className="flex items-end justify-center gap-2">
            {slide.art === "stack" ? (
              <>
                <Vinyl className="w-10" />
                <Vinyl className="w-14" spinning />
                <Vinyl className="w-10" />
              </>
            ) : slide.art === "coin" ? (
              <span className="display flex h-16 w-16 items-center justify-center rounded-full border-4 border-ink bg-magenta text-2xl text-cream">
                +2
              </span>
            ) : (
              <div className="animate-name-pop">
                <Vinyl className="w-16" spinning />
              </div>
            )}
          </div>
          <h2 className="display mt-3 text-2xl leading-tight text-balance">{slide.title}</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{slide.body}</div>

        <div className="shrink-0 border-t-2 border-ink/10 px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-center gap-3">
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`Ir para a parte ${index + 1}: ${item.title}`}
                aria-current={index === step}
                className={`cursor-pointer transition-all duration-200 ${
                  index === step ? "scale-110" : "opacity-30 hover:opacity-70"
                }`}
              >
                <Vinyl className="w-7" spinning={index === step} />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="aqua" fullWidth onClick={() => setStep(step - 1)}>
                Como é mesmo?
              </Button>
            ) : null}
            <Button
              variant={last ? "magenta" : "ink"}
              fullWidth
              onClick={() => (last ? onClose() : setStep(step + 1))}
            >
              {last ? "Valeu, pai. Entendido" : "Saquei"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
