"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";
import { useRecorder } from "@/hooks/useRecorder";
import { api } from "@/lib/api";
import { maxAudioSeconds, maxMessageLength } from "@/lib/game/chat";
import type { ChatMessage } from "@/types/room";

interface ChatBubbleProps {
  code: string;
  token: string;
  myId: string | null;
}

const quickEmojis = ["😂", "😭", "🔥", "🎶", "👏", "😱", "🤡", "💀", "❤️", "🫠", "🥁", "🏆"];

function clockFor(stamp: string): string {
  const when = new Date(stamp);

  return `${String(when.getHours()).padStart(2, "0")}:${String(when.getMinutes()).padStart(2, "0")}`;
}

export function ChatBubble({ code, token, myId }: ChatBubbleProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [seenCount, setSeenCount] = useState(0);

  const feed = useRef<HTMLDivElement>(null);
  const recorder = useRecorder(maxAudioSeconds);
  const { spot, handles } = useDraggable({ x: 16, y: 120 });

  const load = useCallback(async () => {
    try {
      const { messages: fresh } = await api.chat(code, token);

      setMessages(fresh);
    } catch {
      return;
    }
  }, [code, token]);

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const timer = window.setInterval(() => void load(), 2500);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, [load]);

  useEffect(() => {
    if (!open) {
      return;
    }

    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!problem) {
      return;
    }

    const timer = window.setTimeout(() => setProblem(null), 4000);

    return () => window.clearTimeout(timer);
  }, [problem]);

  const sendText = async () => {
    const body = draft.trim();

    if (body.length === 0 || sending) {
      return;
    }

    setSending(true);

    try {
      const saved = await api.sendText(code, token, body);

      setMessages((current) => [...current, saved]);
      setDraft("");
      setShowEmojis(false);
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : "Não consegui enviar.");
    } finally {
      setSending(false);
    }
  };

  const sendTake = async () => {
    if (!recorder.take || sending) {
      return;
    }

    setSending(true);

    try {
      const saved = await api.sendAudio(code, token, recorder.take.blob, recorder.take.seconds);

      setMessages((current) => [...current, saved]);
      recorder.discard();
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : "Não consegui enviar o áudio.");
    } finally {
      setSending(false);
    }
  };

  const unread = open ? 0 : Math.max(0, messages.length - seenCount);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setSeenCount(messages.length);
          setOpen(true);
        }}
        aria-label="Abrir o chat da mesa"
        style={{ left: spot.x, top: spot.y }}
        data-drag-root
        className="fixed z-[52] flex h-16 w-16 cursor-pointer items-center justify-center rounded-[1.4rem] border-4 border-ink bg-sun text-2xl shadow-[0_7px_0_var(--color-ink)] transition-transform duration-150 hover:-translate-y-[3px] active:translate-y-[2px]"
      >
        💬
        {unread > 0 ? (
          <span className="display absolute -right-2 -top-2 flex h-7 min-w-7 items-center justify-center rounded-full border-3 border-ink bg-magenta px-1 text-xs text-cream">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <div
      data-drag-root
      style={{ left: spot.x, top: spot.y }}
      className="fixed z-[52] flex max-h-[26rem] w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.4rem] border-4 border-ink bg-paper shadow-[0_12px_0_var(--color-ink)]"
    >
      <div
        {...handles}
        className="flex shrink-0 cursor-grab touch-none items-center gap-2 bg-grape px-3 py-2 text-cream active:cursor-grabbing"
      >
        <span className="text-lg">💬</span>
        <span className="display min-w-0 flex-1 truncate text-sm">Chat da mesa</span>
        <button
          type="button"
          onClick={() => {
            setSeenCount(messages.length);
            setOpen(false);
          }}
          aria-label="Minimizar o chat"
          className="display cursor-pointer rounded-lg bg-cream/20 px-2 py-0.5 text-sm text-cream transition-colors hover:bg-cream/35"
        >
          —
        </button>
      </div>

      <div ref={feed} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-sun-light/40 p-2.5">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-xs font-semibold text-ink/50">
            Ninguém falou nada ainda.
            <br />
            As conversas somem quando a partida acaba.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {messages.map((message) => {
              const mine = message.player_id === myId;

              return (
                <li key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl border-2 border-ink px-2.5 py-1.5 ${
                      mine ? "bg-aqua" : "bg-paper"
                    }`}
                  >
                    {mine ? null : (
                      <span className="display block text-[0.65rem] text-ink/60">
                        {message.author_name}
                      </span>
                    )}

                    {message.kind === "AUDIO" && message.audio_path ? (
                      <audio
                        controls
                        preload="none"
                        src={message.audio_path}
                        className="mt-0.5 h-9 w-52 max-w-full"
                      />
                    ) : (
                      <span className="block break-words text-sm leading-snug text-ink">
                        {message.body}
                      </span>
                    )}

                    <span className="mt-0.5 block text-right text-[0.6rem] font-semibold text-ink/45">
                      {clockFor(message.created_at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {problem ? (
        <p className="shrink-0 bg-magenta px-3 py-1.5 text-center text-[0.7rem] font-semibold text-cream">
          {problem}
        </p>
      ) : null}

      {recorder.problem ? (
        <p className="shrink-0 bg-magenta px-3 py-1.5 text-center text-[0.7rem] font-semibold text-cream">
          {recorder.problem}
        </p>
      ) : null}

      {showEmojis ? (
        <div className="shrink-0 border-t-2 border-ink/15 bg-paper px-2 py-1.5">
          <div className="grid grid-cols-6 gap-1">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setDraft((current) => `${current}${emoji}`)}
                className="cursor-pointer rounded-lg py-1 text-xl transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-t-2 border-ink/15 bg-paper p-2">
        {recorder.stage === "REVIEW" && recorder.take ? (
          <div className="flex flex-col gap-1.5">
            <audio controls src={recorder.take.url} className="h-9 w-full" />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={recorder.discard}
                className="display flex-1 cursor-pointer rounded-xl border-2 border-ink bg-paper py-2 text-xs text-ink transition-colors hover:bg-sun-light"
              >
                Apagar
              </button>
              <button
                type="button"
                onClick={() => void sendTake()}
                disabled={sending}
                className="display flex-[2] cursor-pointer rounded-xl border-2 border-ink bg-magenta py-2 text-xs text-cream shadow-[0_3px_0_var(--color-ink)] transition-transform hover:-translate-y-[1px] disabled:opacity-50"
              >
                {sending ? "Enviando..." : `Enviar ${recorder.take.seconds}s`}
              </button>
            </div>
          </div>
        ) : recorder.stage === "RECORDING" ? (
          <button
            type="button"
            onClick={recorder.stop}
            className="display flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-ink bg-magenta py-2.5 text-sm text-cream shadow-[0_3px_0_var(--color-ink)]"
          >
            <span className="animate-pulse-ring h-3 w-3 rounded-full bg-cream" />
            Gravando {recorder.elapsed}s · tocar para parar
          </button>
        ) : (
          <div className="flex items-end gap-1.5">
            <button
              type="button"
              onClick={() => setShowEmojis((current) => !current)}
              aria-label="Abrir os emojis"
              className="shrink-0 cursor-pointer rounded-xl border-2 border-ink bg-paper px-2 py-1.5 text-lg transition-colors hover:bg-sun-light"
            >
              😀
            </button>

            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void sendText();
                }
              }}
              placeholder="Manda aí"
              maxLength={maxMessageLength}
              autoComplete="off"
              lang="pt-BR"
              className="min-w-0 flex-1 rounded-xl border-2 border-ink bg-cream px-2.5 py-2 text-sm text-ink outline-none placeholder:text-ink/35 focus:ring-4 focus:ring-grape/20"
            />

            {draft.trim().length > 0 ? (
              <button
                type="button"
                onClick={() => void sendText()}
                disabled={sending}
                aria-label="Enviar a mensagem"
                className="shrink-0 cursor-pointer rounded-xl border-2 border-ink bg-magenta px-3 py-2 text-sm text-cream shadow-[0_3px_0_var(--color-ink)] transition-transform hover:-translate-y-[1px] disabled:opacity-50"
              >
                ➤
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void recorder.start()}
                aria-label="Gravar um áudio"
                className="shrink-0 cursor-pointer rounded-xl border-2 border-ink bg-aqua px-3 py-2 text-lg shadow-[0_3px_0_var(--color-ink)] transition-transform hover:-translate-y-[1px]"
              >
                🎤
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
