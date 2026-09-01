export const RoomPhase = {
  Lobby: "LOBBY",
  Playing: "PLAYING",
  Finished: "FINISHED",
} as const;

export type RoomPhase = (typeof RoomPhase)[keyof typeof RoomPhase];

export interface SharedResult {
  id: string;
  playerId: string;
  playerName: string;
  correct: boolean;
  track: { artist: string; title: string; year: number };
  chosenLabel: string;
  correctLabel: string;
  artistTried: boolean;
  titleTried: boolean;
  artistHit: boolean;
  titleHit: boolean;
  earnedTokens: number;
  bonusReason: string | null;
}

export interface RoomRow {
  id: string;
  code: string;
  phase: RoomPhase;
  deck: "NATIONAL" | "INTERNATIONAL" | "MIXED";
  target_cards: number;
  difficulty: "CLASSIC" | "QUICK" | "MARATHON";
  seed_cards: number;
  token_cost: number;
  host_player_id: string | null;
  winner_player_id: string | null;
  turn_player_id: string | null;
  starter_player_id: string | null;
  current_track_id: string | null;
  current_started_at: string | null;
  turn_started_at: string | null;
  turn_seconds: number;
  last_result: SharedResult | null;
}

export interface PlayerRow {
  id: string;
  room_id: string;
  name: string;
  seat: number;
  is_host: boolean;
  is_turntable: boolean;
  tokens: number;
  timeline_count: number;
}

export interface TimelineCardRow {
  id: string;
  room_id: string;
  player_id: string;
  track_id: string;
  year: number;
  is_seed: boolean;
}

export interface EventRow {
  id: number;
  sequence: number;
  type: string;
  actor_id: string | null;
  track_id: string | null;
  detail: string | null;
  created_at: string;
}
