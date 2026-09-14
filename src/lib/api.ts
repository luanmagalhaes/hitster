import type { EventRow, PlayerRow, RoomRow, TimelineCardRow } from "@/types/room";
import type { DeckKind } from "@/types/track";
import { messageForStatus, networkMessage, unreadableMessage } from "@/lib/messages";

export class ApiError extends Error {}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-player-token": token } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(
      networkMessage(typeof navigator === "undefined" || navigator.onLine !== false),
    );
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const given = (payload as { error?: string } | null)?.error;

    throw new ApiError(given ?? messageForStatus(response.status));
  }

  if (payload === null) {
    throw new ApiError(unreadableMessage);
  }

  return payload as T;
}

export interface JoinResponse {
  code: string;
  playerId: string;
  accessToken: string;
  name: string;
}

export interface RoomState {
  room: RoomRow;
  players: PlayerRow[];
  cards: TimelineCardRow[];
  events: EventRow[];
  remaining: number;
  meId: string | null;
}

export interface GuessResult {
  correct: boolean;
  track: { artist: string; title: string; year: number };
  correctSlot: number;
  chosenLabel: string;
  correctLabel: string;
  winnerId: string | null;
  artistTried: boolean;
  titleTried: boolean;
  artistHit: boolean;
  titleHit: boolean;
  earnedTokens: number;
  bonusReason: string | null;
}

export const api = {
  createRoom: (hostName: string, deck: DeckKind, difficulty: string, mode: string) =>
    request<JoinResponse>("/api/rooms", {
      method: "POST",
      body: JSON.stringify({ hostName, deck, difficulty, mode }),
    }),

  steal: (code: string, token: string) =>
    request<{ stolen: true; victimName: string }>(
      `/api/rooms/${code}/steal`,
      { method: "POST" },
      token,
    ),

  timeout: (code: string) =>
    request<{ skipped: boolean; from?: string; to?: string }>(`/api/rooms/${code}/timeout`, {
      method: "POST",
    }),

  leave: (code: string, token: string) =>
    request<{ left: boolean; lastOne: boolean }>(
      `/api/rooms/${code}/leave`,
      { method: "POST" },
      token,
    ),

  removePlayer: (code: string, token: string, playerId: string) =>
    request<{ removed: string; turnPassed: boolean }>(
      `/api/rooms/${code}/remove`,
      { method: "POST", body: JSON.stringify({ playerId }) },
      token,
    ),

  spendTokens: (code: string, token: string) =>
    request<{ track: { artist: string; title: string; year: number } }>(
      `/api/rooms/${code}/tokens`,
      { method: "POST" },
      token,
    ),

  joinRoom: (code: string, name: string) =>
    request<JoinResponse>(`/api/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  state: (code: string, token?: string) =>
    request<RoomState>(`/api/rooms/${code}`, { method: "GET" }, token),

  start: (code: string, token: string) =>
    request<{ started: boolean }>(`/api/rooms/${code}/start`, { method: "POST" }, token),

  play: (code: string, token: string) =>
    request<{ trackId: string; alreadyPlaying: boolean }>(
      `/api/rooms/${code}/play`,
      { method: "POST" },
      token,
    ),

  nowPlaying: (code: string) =>
    request<{ trackId: string | null; previewUrl: string | null; confident?: boolean }>(
      `/api/rooms/${code}/play`,
      { method: "GET" },
    ),

  skip: (code: string, token: string) =>
    request<{ skipped: boolean }>(`/api/rooms/${code}/skip`, { method: "POST" }, token),

  guess: (
    code: string,
    token: string,
    input: { slotIndex: number; artistGuess?: string; titleGuess?: string },
  ) =>
    request<GuessResult>(
      `/api/rooms/${code}/guess`,
      { method: "POST", body: JSON.stringify(input) },
      token,
    ),
};
