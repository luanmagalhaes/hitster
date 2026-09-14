"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AudioDeck } from "@/components/game/AudioDeck";
import { ChatBubble } from "@/components/game/ChatBubble";
import { HomeScreen } from "@/components/game/HomeScreen";
import { HowToPlay } from "@/components/game/HowToPlay";
import { NoticeModal } from "@/components/game/NoticeModal";
import { ResultModal } from "@/components/game/ResultModal";
import { StarterRoll } from "@/components/game/StarterRoll";
import { StealModal } from "@/components/game/StealModal";
import { ThiefButton } from "@/components/game/ThiefButton";
import { StealNewsModal } from "@/components/game/StealNewsModal";
import { JoinScreen } from "@/components/game/JoinScreen";
import { LobbyScreen } from "@/components/game/LobbyScreen";
import { TableScreen } from "@/components/game/TableScreen";
import { VictoryScreen } from "@/components/game/VictoryScreen";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useRoom } from "@/hooks/useRoom";
import { useSession } from "@/hooks/useSession";
import { useNow } from "@/hooks/useNow";
import { useTurnBuzz } from "@/hooks/useTurnBuzz";
import {
  modeLabels,
  secondsUntilSteal,
  stealBlock,
  windowFor,
} from "@/lib/game/steal";
import { api } from "@/lib/api";
import { hostGraceSeconds } from "@/lib/game/limits";
import { rememberStarter, starterSeen } from "@/lib/session";
import {
  prefsSnapshot,
  rememberTutorialSeen,
  serverPrefsSnapshot,
  subscribePrefs,
} from "@/lib/prefs";
import type { RoomRow } from "@/types/room";

type View = "HOME" | "CREATE" | "JOIN";

const previewAttempts = 4;

export function GameApp() {
  const { session, save, clear, seats, seatFor, forget } = useSession();
  const [view, setView] = useState<View>("HOME");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seenResultId, setSeenResultId] = useState<string | null>(null);
  const [seenStarter, setSeenStarter] = useState<string | null>(() => starterSeen());
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [seenNoticeId, setSeenNoticeId] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [seenStealId, setSeenStealId] = useState<string | null>(null);
  const [passedOnTrack, setPassedOnTrack] = useState<string | null>(null);
  const [askedRules, setAskedRules] = useState(false);
  const prefs = useSyncExternalStore(subscribePrefs, prefsSnapshot, serverPrefsSnapshot);
  const showRules = askedRules || !prefs.tutorialSeen;

  const { state, refresh } = useRoom(session?.code ?? null, session?.accessToken ?? null);

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
  const starterName = state?.players.find((player) => player.id === starterId)?.name ?? "alguém";

  const myTurn = Boolean(state?.meId && state.room.turn_player_id === state.meId);

  useTurnBuzz(myTurn, state?.room.phase === "PLAYING");

  const now = useNow(1000);
  const trackStartedAt = state?.room.current_started_at ?? null;
  const listenedSeconds = trackStartedAt ? (now - new Date(trackStartedAt).getTime()) / 1000 : 0;
  const stealSeconds = state ? windowFor(state.room.mode, state.room.steal_count) : 30;
  const stolenByMe = Boolean(state?.meId && state.room.steal_player_id === state.meId);
  const mySpareCards = state
    ? state.cards.filter((card) => card.player_id === state.meId && !card.is_seed).length
    : 0;
  const stealShut = state
    ? stealBlock({
        playing: state.room.phase === "PLAYING",
        trackPlaying: Boolean(state.room.current_track_id) && trackStartedAt !== null,
        isMyTurn: myTurn,
        stolenBy: state.room.steal_player_id,
        elapsedSeconds: listenedSeconds,
        waitSeconds: stealSeconds,
        spareCards: mySpareCards,
      })
    : "NOT_PLAYING";
  const stealRipe = stealShut === null || stealShut === "NO_CARD";
  const offerSteal = stealRipe && passedOnTrack !== state?.room.current_track_id;
  const victimName =
    state?.players.find((player) => player.id === state.room.turn_player_id)?.name ?? "a pessoa";
  const stealNews = state?.room.last_steal ?? null;
  const freshSteal = stealNews && stealNews.id !== seenStealId ? stealNews : null;

  const notice = state?.room.last_notice ?? null;
  const visibleNotice = notice && notice.id !== seenNoticeId ? notice : null;
  const sharedResult = state?.room.last_result ?? null;
  const visibleResult =
    sharedResult && sharedResult.id !== seenResultId && !currentTrackId ? sharedResult : null;
  const turnStartedAt = state?.room.turn_started_at ?? null;
  const turnSeconds = state?.room.turn_seconds ?? 60;
  const playingPhase = state?.room.phase === "PLAYING";
  const lobbyGraceLeft = state?.room.created_at
    ? Math.max(
        0,
        Math.ceil(hostGraceSeconds - (now - new Date(state.room.created_at).getTime()) / 1000),
      )
    : hostGraceSeconds;

  const clockRef = useRef<RoomRow | null>(null);

  useEffect(() => {
    clockRef.current = state?.room ?? null;
  }, [state?.room]);

  useEffect(() => {
    const code = session?.code;

    if (!code || !playingPhase) {
      return;
    }

    const overdue = () => {
      const room = clockRef.current;

      if (!room) {
        return false;
      }

      const since = (stamp: string | null) =>
        stamp ? (Date.now() - new Date(stamp).getTime()) / 1000 : null;

      if (!room.current_track_id) {
        const waited = since(room.turn_started_at);

        return waited !== null && waited >= room.turn_seconds;
      }

      const window = windowFor(room.mode, room.steal_count);

      if (room.steal_player_id) {
        const held = since(room.steal_started_at);

        return held !== null && held >= window;
      }

      const open = since(room.current_started_at);

      return open !== null && open >= room.turn_seconds + window;
    };

    const check = async () => {
      if (!overdue()) {
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
  }, [session?.code, playingPhase, refresh]);

  useEffect(() => {
    const code = session?.code;

    if (!code || !currentTrackId || previews[currentTrackId]) {
      return;
    }

    let active = true;
    let attempt = 0;
    let timer = 0;

    const look = async () => {
      if (!active) {
        return;
      }

      attempt += 1;

      try {
        const data = await api.nowPlaying(code);

        if (!active) {
          return;
        }

        if (data.trackId && data.previewUrl) {
          setPreviews((current) => ({
            ...current,
            [data.trackId as string]: data.previewUrl,
          }));

          return;
        }
      } catch {
        if (!active) {
          return;
        }
      }

      if (attempt < previewAttempts) {
        timer = window.setTimeout(() => void look(), attempt * 1500);
      } else if (active) {
        setPreviews((current) => ({ ...current, [currentTrackId]: null }));
      }
    };

    void look();

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [session?.code, currentTrackId, previews]);

  const rulesGate = showRules ? (
    <HowToPlay
      onClose={() => {
        setAskedRules(false);
        rememberTutorialSeen();
      }}
    />
  ) : null;

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
        <>
          {rulesGate}
          <JoinScreen
            mode={view === "CREATE" ? "CREATE" : "JOIN"}
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
                    ? await api.createRoom(input.name, "MIXED", "CLASSIC", "CLASSIC")
                    : await api.joinRoom(input.code, input.name);

                save(result);
                setView("HOME");
              })
            }
          />
        </>
      );
    }

    return (
      <>
        {rulesGate}
        <HomeScreen
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
          onRules={() => setAskedRules(true)}
        />
      </>
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
      <>
        {rulesGate}
        <ChatBubble code={session.code} token={session.accessToken} myId={state.meId} />
        <LobbyScreen
          room={state.room}
          players={state.players}
          isHost={me?.is_host ?? false}
          canAnyoneStart={lobbyGraceLeft <= 0}
          graceLeft={lobbyGraceLeft}
          busy={busy}
          error={error}
          onStart={() => run(() => api.start(session.code, session.accessToken))}
          onLeave={leave}
          onSetup={(patch) =>
            run(async () => {
              await api.setup(session.code, session.accessToken, patch);
              await refresh();
            })
          }
        />
      </>
    );
  }

  return (
    <>
      {rulesGate}

      {freshSteal ? (
        <StealNewsModal
          news={freshSteal}
          myId={state.meId}
          onClose={() => setSeenStealId(freshSteal.id)}
        />
      ) : offerSteal ? (
        <>
          <StealModal
            victimName={victimName}
            spareCards={mySpareCards}
            onDismiss={() => setPassedOnTrack(state.room.current_track_id)}
          />
          {stealShut === null ? (
            <ThiefButton
              seed={`${state.room.current_track_id ?? "x"}-${state.room.steal_count}`}
              disabled={busy}
              onSteal={() =>
                run(async () => {
                  await api.steal(session.code, session.accessToken);
                  await refresh();
                })
              }
            />
          ) : null}
        </>
      ) : null}

      {showStarter && starterId ? (
        <StarterRoll
          starterName={starterName}
          isMe={starterId === state.meId}
          onDone={() => {
            rememberStarter(starterId);
            setSeenStarter(starterId);
          }}
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

      <ChatBubble code={session.code} token={session.accessToken} myId={state.meId} />

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
        stolenByMe={stolenByMe}
        stealCountdown={secondsUntilSteal(listenedSeconds, stealSeconds)}
        modeLabel={modeLabels[state.room.mode]}
        stealWindow={stealSeconds}
        thiefName={
          state.room.steal_player_id
            ? (state.players.find((player) => player.id === state.room.steal_player_id)?.name ??
              null)
            : null
        }
        audio={
          <AudioDeck
            previewUrl={currentTrackId ? (previews[currentTrackId] ?? null) : null}
            hasTrack={Boolean(currentTrackId)}
            searching={currentTrackId !== null && !(currentTrackId in previews)}
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
        onRules={() => setAskedRules(true)}
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
