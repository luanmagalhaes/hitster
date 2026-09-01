"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Vinyl } from "@/components/ui/Vinyl";

type ConfirmTone = "danger" | "go";

interface ConfirmModalProps {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  body,
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const danger = tone === "danger";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="animate-sleeve-slide w-full max-w-sm overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div
          className={`flex items-center gap-4 p-5 ${danger ? "bg-magenta text-cream" : "bg-aqua text-ink"}`}
        >
          <Vinyl spinning={!danger} className="w-14 shrink-0" />
          <span className="display text-xl leading-tight">{title}</span>
        </div>

        <div className="p-5">
          <div className="text-sm leading-relaxed text-ink/80">{body}</div>

          <div className="mt-5 flex gap-2.5">
            <Button variant="ghost" fullWidth disabled={busy} onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button
              variant={danger ? "magenta" : "ink"}
              fullWidth
              disabled={busy}
              onClick={onConfirm}
            >
              {busy ? "Um instante..." : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
