import type { EventRow, PlayerRow, RoomRow, TimelineCardRow } from "@/types/room";
import type { DeckKind } from "@/types/track";

export class ApiError extends Error {}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-player-token": token } : {}),
      ...init.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError((payload as { error?: string }).error ?? "algo deu errado, tente de novo");
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
  createRoom: (hostName: string, deck: DeckKind, difficulty: string) =>
    request<JoinResponse>("/api/rooms", {
      method: "POST",
      body: JSON.stringify({ hostName, deck, difficulty }),
    }),

  timeout: (code: string) =>
    request<{ skipped: boolean; from?: string; to?: string }>(`/api/rooms/${code}/timeout`, {
      method: "POST",
    }),

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
