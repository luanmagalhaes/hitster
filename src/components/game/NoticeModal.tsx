"use client";

import { Button } from "@/components/ui/Button";
import { Dice } from "@/components/game/Dice";
import { Vinyl } from "@/components/ui/Vinyl";
import type { RoomNotice } from "@/types/room";

interface NoticeModalProps {
  notice: RoomNotice;
  onClose: () => void;
}

const tones: Record<RoomNotice["kind"], string> = {
  REMOVED: "bg-magenta text-cream",
  LEFT: "bg-grape text-cream",
  TIMEOUT: "bg-sun text-ink",
  HOST_CHANGED: "bg-aqua text-ink",
};

export function NoticeModal({ notice, onClose }: NoticeModalProps) {
  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center bg-ink/70 p-4 sm:items-center">
      <div className="animate-sleeve-slide w-full max-w-sm overflow-hidden rounded-[1.75rem] border-4 border-ink bg-paper shadow-[0_14px_0_var(--color-ink)]">
        <div className={`flex items-center gap-4 p-5 ${tones[notice.kind]}`}>
          {notice.kind === "TIMEOUT" ? (
            <Dice face={4} className="w-14 shrink-0" />
          ) : (
            <Vinyl className="w-14 shrink-0" />
          )}
          <span className="display text-xl leading-tight">{notice.title}</span>
        </div>

        <div className="p-5">
          <p className="text-sm leading-relaxed text-ink/80">{notice.text}</p>

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
