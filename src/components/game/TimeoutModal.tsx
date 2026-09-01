"use client";

import { Button } from "@/components/ui/Button";
import { Vinyl } from "@/components/ui/Vinyl";

interface TimeoutModalProps {
  from: string;
  to: string;
  wasMe: boolean;
  onClose: () => void;
}

export function TimeoutModal({ from, to, wasMe, onClose }: TimeoutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div className="animate-sleeve-slide w-full max-w-sm overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper text-center shadow-[0_14px_0_var(--color-ink)]">
        <div className="bg-sun p-5">
          <Vinyl className="mx-auto w-20" />
          <span className="display mt-3 block text-2xl leading-tight text-ink">
            {wasMe ? "Passou o tempo!" : "Tempo esgotado"}
          </span>
        </div>

        <div className="p-5">
          <p className="text-sm leading-relaxed text-ink/75">
            {wasMe ? (
              <>
                Você demorou pra tocar a música, então a vez foi para{" "}
                <strong className="text-ink">{to}</strong>. Sem estresse, ela volta pra você na
                próxima rodada.
              </>
            ) : (
              <>
                <strong className="text-ink">{from}</strong> demorou demais e a vez passou para{" "}
                <strong className="text-ink">{to}</strong>.
              </>
            )}
          </p>

          <div className="mt-4">
            <Button variant="ink" fullWidth onClick={onClose}>
              Beleza
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
