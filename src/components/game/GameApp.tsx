"use client";

import { useCallback, useEffect, useState } from "react";
import { AudioDeck } from "@/components/game/AudioDeck";
import { HomeScreen } from "@/components/game/HomeScreen";
import { NoticeModal } from "@/components/game/NoticeModal";
import { ResultModal } from "@/components/game/ResultModal";
import { StarterRoll } from "@/components/game/StarterRoll";
import { UpdateBanner } from "@/components/game/UpdateBanner";
import { JoinScreen } from "@/components/game/JoinScreen";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { TableScreen } from "@/components/game/TableScreen";
import { VictoryScreen } from "@/components/game/VictoryScreen";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useLiveVersion } from "@/hooks/useLiveVersion";
import { useRoom } from "@/hooks/useRoom";
import { useSession } from "@/hooks/useSession";
import { api } from "@/lib/api";
import type { DeckKind } from "@/types/track";

type View = "HOME" | "CREATE" | "JOIN";

export function GameApp() {
  const { session, save, clear, seats, seatFor, forget } = useSession();
  const [view, setView] = useState<View>("HOME");
  const [deck, setDeck] = useState<DeckKind>("MIXED");
  const [difficulty, setDifficulty] = useState("CLASSIC");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenResultId, setSeenResultId] = useState<string | null>(null);
  const [seenStarter, setSeenStarter] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [seenNoticeId, setSeenNoticeId] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const { state, refresh } = useRoom(session?.code ?? null, session?.accessToken ?? null);
  const live = useLiveVersion(state?.version);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = window.setTimeout(() => setError(null), 4000);

    return () => window.clearTimeout(timer);
  }, [error]);

  const currentTrackId = state?.room.current_track_id ?? null;
  const starterId = state?.room.starter_player_id ?? null;
  const showStarter =
    Boolean(starterId) &&
    starterId !== seenStarter &&
    state?.room.phase === "PLAYING" &&
    !state?.room.current_track_id;
  const starterName =
    state?.players.find((player) => player.id === starterId)?.name ?? "alguém";

  const notice = state?.room.last_notice ?? null;
  const visibleNotice = notice && notice.id !== seenNoticeId ? notice : null;
  const sharedResult = state?.room.last_result ?? null;
  const visibleResult =
    sharedResult && sharedResult.id !== seenResultId && !currentTrackId ? sharedResult : null;
  const turnStartedAt = state?.room.turn_started_at ?? null;
  const turnSeconds = state?.room.turn_seconds ?? 60;
  const playingPhase = state?.room.phase === "PLAYING";

  useEffect(() => {
    const code = session?.code;

    if (!code || !playingPhase || currentTrackId || !turnStartedAt) {
      return;
    }

    const check = async () => {
      const elapsed = (Date.now() - new Date(turnStartedAt).getTime()) / 1000;

      if (elapsed < turnSeconds) {
        return;
      }

      try {
        await api.timeout(code);
        await refresh();
      } catch {
        return;
      }
    };

    const timer = window.setInterval(() => void check(), 3000);

    return () => window.clearInterval(timer);
  }, [session?.code, playingPhase, currentTrackId, turnStartedAt, turnSeconds, refresh]);

  useEffect(() => {
    const code = session?.code;

    if (!code || !currentTrackId || currentTrackId in previews) {
      return;
    }

    let active = true;

    void api
      .nowPlaying(code)
      .then((data) => {
        if (active && data.trackId) {
          setPreviews((current) => ({ ...current, [data.trackId as string]: data.previewUrl }));
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [session?.code, currentTrackId, previews]);

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      setBusy(true);
      setError(null);

      try {
        await action();
        await refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "algo deu errado, tente de novo");
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const leave = () => {
    clear();
    setView("HOME");
  };

  const leaveForGood = () =>
    run(async () => {
      if (session) {
        await api.leave(session.code, session.accessToken).catch(() => undefined);
      }

      clear();
      setView("HOME");
    });

  if (!session) {
    if (view === "CREATE" || view === "JOIN") {
      return (
        <JoinScreen
          mode={view === "CREATE" ? "CREATE" : "JOIN"}
          deck={deck}
          difficulty={difficulty}
          onDifficulty={setDifficulty}
          busy={busy}
          error={error}
          onBack={() => setView("HOME")}
          onSubmit={(input) =>
            run(async () => {
              if (view === "JOIN") {
                const known = seatFor(input.code, input.name);

                if (known) {
                  save({
                    code: known.code,
                    playerId: known.playerId,
                    accessToken: known.accessToken,
                    name: known.name,
                  });
                  setView("HOME");

                  return;
                }
              }

              const result =
                view === "CREATE"
                  ? await api.createRoom(input.name, deck, difficulty)
                  : await api.joinRoom(input.code, input.name);

              save(result);
              setView("HOME");
            })
          }
        />
      );
    }

    return (
      <HomeScreen
        deck={deck}
        onDeck={setDeck}
        seats={seats}
        onResume={(seat) =>
          save({
            code: seat.code,
            playerId: seat.playerId,
            accessToken: seat.accessToken,
            name: seat.name,
          })
        }
        onForget={forget}
        onCreate={() => setView("CREATE")}
        onJoin={() => setView("JOIN")}
      />
    );
  }

  if (!state) {
    return (
      <div className="stage-sun flex min-h-dvh items-center justify-center px-8">
        <p className="display text-lg text-ink/70">Carregando a sala...</p>
      </div>
    );
  }

  const me = state.players.find((player) => player.id === state.meId);

  if (state.room.phase === "FINISHED") {
    return (
      <VictoryScreen
        players={state.players}
        cards={state.cards}
        winnerId={state.room.winner_player_id}
        myId={state.meId}
        onExit={leave}
      />
    );
  }

  if (state.room.phase === "LOBBY") {
    return (
      <LobbyScreen
        room={state.room}
        players={state.players}
        isHost={me?.is_host ?? false}
        busy={busy}
        error={error}
        onStart={() => run(() => api.start(session.code, session.accessToken))}
        onLeave={leave}
      />
    );
  }

  return (
    <>
      {live.stale ? <UpdateBanner onReload={live.reloadNow} /> : null}

      {showStarter && starterId ? (
        <StarterRoll
          starterName={starterName}
          isMe={starterId === state.meId}
          onDone={() => setSeenStarter(starterId)}
        />
      ) : null}

      {visibleResult ? (
        <ResultModal
          result={visibleResult}
          isMe={visibleResult.playerId === state.meId}
          onClose={() => setSeenResultId(visibleResult.id)}
        />
      ) : null}

      {visibleNotice ? (
        <NoticeModal notice={visibleNotice} onClose={() => setSeenNoticeId(visibleNotice.id)} />
      ) : null}

      <TableScreen
      room={state.room}
      players={state.players}
      cards={state.cards}
      events={state.events}
      remaining={state.remaining}
      myId={state.meId}
      busy={busy}
      error={error}
      turnStartedAt={turnStartedAt}
      turnSeconds={turnSeconds}
      audio={
        <AudioDeck
          previewUrl={currentTrackId ? previews[currentTrackId] ?? null : null}
          hasTrack={Boolean(currentTrackId)}
          onSkip={() => run(() => api.skip(session.code, session.accessToken))}
        />
      }
      onPlay={() => run(() => api.play(session.code, session.accessToken))}
      isHost={me?.is_host ?? false}
      onRemovePlayer={(playerId) =>
        run(() => api.removePlayer(session.code, session.accessToken, playerId))
      }
      onSpendTokens={() => run(() => api.spendTokens(session.code, session.accessToken))}
      onGuess={(input) =>
        run(async () => {
          await api.guess(session.code, session.accessToken, input);
        })
      }
        onLeave={() => setConfirmingLeave(true)}
      />

      {confirmingLeave ? (
        <ConfirmModal
          title="Sair da partida?"
          tone="danger"
          busy={busy}
          confirmLabel="Sair mesmo"
          cancelLabel="Continuar jogando"
          body={
            <>
              <p>
                Você sai da mesa de vez e <strong className="text-ink">não consegue voltar</strong>{" "}
                para esta sala.
              </p>
              <ul className="mt-3 flex flex-col gap-1.5 text-xs">
                <li className="rounded-xl bg-sun-light px-3 py-2">
                  Suas cartas voltam para o monte
                </li>
                {me?.is_host ? (
                  <li className="rounded-xl bg-sun-light px-3 py-2">
                    Outra pessoa vira o host da sala
                  </li>
                ) : null}
              </ul>
            </>
          }
          onCancel={() => setConfirmingLeave(false)}
          onConfirm={() => {
            setConfirmingLeave(false);
            void leaveForGood();
          }}
        />
      ) : null}
    </>
  );
}
