import { tracksForDeck, trackById } from "@/data/tracks";
import { answerMatches, findPreview } from "@/lib/deezer";
import { difficultyPresets, pickSpreadSeeds, type Difficulty } from "@/lib/game/seeds";
import {
  correctSlotIndex,
  isSlotCorrect,
  isValidSlot,
  labelForSlot,
  nextSeat,
} from "@/lib/game/timeline";
import { serverClient } from "@/lib/supabase/server";
import { shuffle } from "@/utils/shuffle";
import type { DeckKind } from "@/types/track";
import { RoomPhase, type PlayerRow, type RoomRow } from "@/types/room";

export class ServiceError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const minPlayers = 2;
const maxPlayers = 10;

function createToken(): string {
  return crypto.randomUUID().replaceAll("-", "");
}

async function loadRoom(code: string): Promise<RoomRow> {
  const { data, error } = await serverClient()
    .from("vt_rooms")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  if (!data) {
    throw new ServiceError("sala não encontrada", 404);
  }

  return data as RoomRow;
}

async function loadPlayer(room: RoomRow, token: string) {
  const { data, error } = await serverClient()
    .from("vt_player_secrets")
    .select("player_id, vt_players(*)")
    .eq("access_token", token)
    .eq("room_id", room.id)
    .maybeSingle();

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  if (!data) {
    throw new ServiceError("você não está mais nesta sala", 401);
  }

  return (data as unknown as { player_id: string; vt_players: PlayerRow }).vt_players;
}

async function record(input: {
  roomId: string;
  type: string;
  actorId?: string | null;
  trackId?: string | null;
  detail?: string | null;
}) {
  const client = serverClient();
  const { data: sequence } = await client.rpc("vt_next_sequence", { p_room: input.roomId });

  await client.from("vt_events").insert({
    room_id: input.roomId,
    sequence,
    type: input.type,
    actor_id: input.actorId ?? null,
    track_id: input.trackId ?? null,
    detail: input.detail ?? null,
  });
}

async function seatFor(roomId: string) {
  const client = serverClient();
  const { count } = await client
    .from("vt_players")
    .select("id", { count: "exact", head: true })
    .eq("room_id", roomId);

  if ((count ?? 0) >= maxPlayers) {
    throw new ServiceError(`a sala está cheia (máximo de ${maxPlayers} jogadores)`, 409);
  }

  const { data: last } = await client
    .from("vt_players")
    .select("seat")
    .eq("room_id", roomId)
    .order("seat", { ascending: false })
    .limit(1)
    .maybeSingle();

  return ((last?.seat as number | undefined) ?? 0) + 1;
}

export async function createRoom(input: {
  hostName: string;
  deck: DeckKind;
  difficulty?: Difficulty;
}) {
  const client = serverClient();
  const { data: code, error: codeError } = await client.rpc("vt_generate_code");

  if (codeError) {
    throw new ServiceError(codeError.message, 500);
  }

  const difficulty: Difficulty = input.difficulty ?? "NORMAL";
  const preset = difficultyPresets[difficulty];

  const { data: room, error: roomError } = await client
    .from("vt_rooms")
    .insert({
      code,
      deck: input.deck,
      difficulty,
      seed_cards: preset.seedCards,
      target_cards: preset.targetCards,
      token_cost: preset.tokenCost,
    })
    .select()
    .single();

  if (roomError) {
    throw new ServiceError(roomError.message, 500);
  }

  const joined = await joinRoom({ code: room.code as string, name: input.hostName, isHost: true });

  await client
    .from("vt_rooms")
    .update({ host_player_id: joined.playerId })
    .eq("id", room.id);

  return joined;
}

export async function joinRoom(input: { code: string; name: string; isHost?: boolean }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const name = input.name.trim();

  if (name.length < 1 || name.length > 24) {
    throw new ServiceError("escolha um nome de 1 a 24 caracteres", 422);
  }

  if (room.phase !== RoomPhase.Lobby) {
    throw new ServiceError("essa partida já começou", 409);
  }

  const seat = await seatFor(room.id);

  const { data: player, error } = await client
    .from("vt_players")
    .insert({
      room_id: room.id,
      name,
      seat,
      is_host: input.isHost ?? false,
      is_turntable: input.isHost ?? false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ServiceError(
        error.message.includes("seat") ? "não há assento livre" : "esse nome já está na mesa",
        409,
      );
    }

    throw new ServiceError(error.message, 500);
  }

  const accessToken = createToken();

  await client
    .from("vt_player_secrets")
    .insert({ player_id: player.id, room_id: room.id, access_token: accessToken });

  await record({ roomId: room.id, type: "PLAYER_JOINED", actorId: player.id, detail: name });

  return {
    code: room.code,
    playerId: player.id as string,
    accessToken,
    name,
  };
}

export async function startMatch(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (!me.is_host) {
    throw new ServiceError("só o host pode começar a partida", 403);
  }

  if (room.phase !== RoomPhase.Lobby) {
    throw new ServiceError("essa partida já começou", 409);
  }

  const { data: players } = await client
    .from("vt_players")
    .select("id, seat")
    .eq("room_id", room.id)
    .order("seat");

  const roster = players ?? [];

  if (roster.length < minPlayers) {
    throw new ServiceError(`precisa de pelo menos ${minPlayers} jogadores`, 409);
  }

  const pool = tracksForDeck(room.deck);
  const seedCount = room.seed_cards;
  const used = new Set<string>();
  const rows: Array<{ room_id: string; player_id: string; track_id: string; year: number }> = [];

  for (const player of roster) {
    const available = pool.filter((track) => !used.has(track.id));
    const seeds = pickSpreadSeeds(available, seedCount);

    for (const track of seeds) {
      used.add(track.id);
      rows.push({
        room_id: room.id,
        player_id: player.id,
        track_id: track.id,
        year: track.year,
      });
    }
  }

  const rest = shuffle(pool.filter((track) => !used.has(track.id)));

  await client.from("vt_timeline_cards").insert(rows);

  for (let index = 0; index < rest.length; index += 500) {
    await client.from("vt_draw_pile").insert(
      rest.slice(index, index + 500).map((track, offset) => ({
        room_id: room.id,
        track_id: track.id,
        position: index + offset + 1,
      })),
    );
  }

  for (const player of roster) {
    await client.rpc("vt_sync_counts", { p_player: player.id });
  }

  await client
    .from("vt_rooms")
    .update({
      phase: RoomPhase.Playing,
      started_at: new Date().toISOString(),
      turn_player_id: roster[0].id,
    })
    .eq("id", room.id);

  await record({ roomId: room.id, type: "MATCH_STARTED", actorId: me.id });

  return { started: true };
}

export async function drawTrack(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (room.phase !== RoomPhase.Playing) {
    throw new ServiceError("a partida não está em andamento", 409);
  }

  if (room.turn_player_id !== me.id) {
    throw new ServiceError("não é a sua vez", 409);
  }

  if (room.current_track_id) {
    return { trackId: room.current_track_id, alreadyPlaying: true };
  }

  const { data: top } = await client
    .from("vt_draw_pile")
    .select("track_id")
    .eq("room_id", room.id)
    .order("position")
    .limit(1)
    .maybeSingle();

  if (!top) {
    return finishByPileOut(room.id);
  }

  const trackId = top.track_id as string;

  await client
    .from("vt_draw_pile")
    .delete()
    .eq("room_id", room.id)
    .eq("track_id", trackId);

  await client
    .from("vt_rooms")
    .update({ current_track_id: trackId, current_started_at: new Date().toISOString() })
    .eq("id", room.id);

  await record({ roomId: room.id, type: "TRACK_DRAWN", actorId: me.id });

  return { trackId, alreadyPlaying: false };
}

async function finishByPileOut(roomId: string): Promise<never> {
  const client = serverClient();

  const { data: players } = await client
    .from("vt_players")
    .select("id, timeline_count, tokens, seat")
    .eq("room_id", roomId)
    .order("timeline_count", { ascending: false });

  const leader = (players ?? [])[0];

  if (leader) {
    await client
      .from("vt_rooms")
      .update({
        phase: RoomPhase.Finished,
        winner_player_id: leader.id,
        finished_at: new Date().toISOString(),
        current_track_id: null,
        current_started_at: null,
      })
      .eq("id", roomId)
      .is("winner_player_id", null);

    await record({
      roomId,
      type: "MATCH_WON",
      actorId: leader.id as string,
      detail: "o monte acabou, venceu quem tinha mais cartas",
    });
  }

  throw new ServiceError("o monte acabou e a partida foi encerrada", 409);
}

export async function submitGuess(input: {
  code: string;
  token: string;
  slotIndex: number;
  artistGuess?: string;
  titleGuess?: string;
}) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (room.phase !== RoomPhase.Playing) {
    throw new ServiceError("a partida não está em andamento", 409);
  }

  if (room.turn_player_id !== me.id) {
    throw new ServiceError("não é a sua vez", 409);
  }

  if (!room.current_track_id) {
    throw new ServiceError("nenhuma música está tocando", 409);
  }

  const track = trackById(room.current_track_id);

  if (!track) {
    throw new ServiceError("faixa desconhecida", 500);
  }

  const { data: mine } = await client
    .from("vt_timeline_cards")
    .select("year")
    .eq("player_id", me.id)
    .order("year");

  const years = (mine ?? []).map((row) => row.year as number);

  if (!isValidSlot(years, input.slotIndex)) {
    throw new ServiceError("escolha uma das posições da sua linha do tempo", 422);
  }

  const correct = isSlotCorrect(years, input.slotIndex, track.year);
  const artistTried = Boolean(input.artistGuess?.trim());
  const titleTried = Boolean(input.titleGuess?.trim());
  const artistHit = artistTried && answerMatches(input.artistGuess as string, track.artist);
  const titleHit = titleTried && answerMatches(input.titleGuess as string, track.title);
  const bothTried = artistTried && titleTried;
  const earnedTokens = artistHit && titleHit ? 1 : 0;
  const bonusReason = !bothTried
    ? artistTried || titleTried
      ? "A ficha só sai acertando artista E título. Você preencheu só um campo."
      : null
    : earnedTokens > 0
      ? "Artista e título certos: +1 ficha."
      : artistHit
        ? "Acertou o artista, mas errou o título. A ficha exige os dois."
        : titleHit
          ? "Acertou o título, mas errou o artista. A ficha exige os dois."
          : "Errou artista e título, sem ficha.";

  if (earnedTokens > 0) {
    await client
      .from("vt_players")
      .update({ tokens: me.tokens + earnedTokens })
      .eq("id", me.id);
  }

  await client.from("vt_guesses").insert({
    room_id: room.id,
    player_id: me.id,
    track_id: track.id,
    slot_index: input.slotIndex,
    was_correct: correct,
    actual_year: track.year,
  });

  if (correct) {
    await client.from("vt_timeline_cards").insert({
      room_id: room.id,
      player_id: me.id,
      track_id: track.id,
      year: track.year,
    });
  }

  await client.rpc("vt_sync_counts", { p_player: me.id });

  const rightSlot = correctSlotIndex(years, track.year);

  const detail = [
    `${track.artist} — ${track.title}, de ${track.year}`,
    correct
      ? `pôs ${labelForSlot(years, input.slotIndex)} e acertou`
      : `pôs ${labelForSlot(years, input.slotIndex)}, mas ${track.year} fica ${labelForSlot(years, rightSlot)}`,
    earnedTokens > 0 ? "+1 ficha (artista e título)" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  await record({
    roomId: room.id,
    type: correct ? "GUESS_CORRECT" : "GUESS_WRONG",
    actorId: me.id,
    trackId: track.id,
    detail,
  });

  const { data: refreshed } = await client
    .from("vt_players")
    .select("id, seat, timeline_count")
    .eq("room_id", room.id)
    .order("seat");

  const roster = refreshed ?? [];
  const winner = roster.find((player) => (player.timeline_count as number) >= room.target_cards);
  const seats = roster.map((player) => player.seat as number);
  const following = nextSeat(me.seat, seats);
  const nextPlayer = roster.find((player) => player.seat === following);

  if (winner) {
    await client
      .from("vt_rooms")
      .update({
        phase: RoomPhase.Finished,
        winner_player_id: winner.id,
        finished_at: new Date().toISOString(),
        current_track_id: null,
        current_started_at: null,
      })
      .eq("id", room.id);

    await record({ roomId: room.id, type: "MATCH_WON", actorId: winner.id as string });
  } else {
    await client
      .from("vt_rooms")
      .update({
        current_track_id: null,
        current_started_at: null,
        turn_player_id: nextPlayer?.id ?? me.id,
      })
      .eq("id", room.id);
  }

  return {
    correct,
    track: { artist: track.artist, title: track.title, year: track.year },
    correctSlot: correct ? input.slotIndex : rightSlot,
    chosenLabel: labelForSlot(years, input.slotIndex),
    correctLabel: labelForSlot(years, rightSlot),
    winnerId: winner?.id ?? null,
    artistTried,
    titleTried,
    artistHit,
    titleHit,
    earnedTokens,
    bonusReason,
  };
}

export async function roomState(input: { code: string; token?: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);

  const [{ data: players }, { data: cards }, { data: events }, { count: remaining }] =
    await Promise.all([
      client.from("vt_players").select("*").eq("room_id", room.id).order("seat"),
      client
        .from("vt_timeline_cards")
        .select("id, player_id, track_id, year")
        .eq("room_id", room.id)
        .order("year"),
      client
        .from("vt_events")
        .select("*")
        .eq("room_id", room.id)
        .order("sequence", { ascending: false })
        .limit(25),
      client
        .from("vt_draw_pile")
        .select("track_id", { count: "exact", head: true })
        .eq("room_id", room.id),
    ]);

  const me = input.token ? await loadPlayer(room, input.token).catch(() => null) : null;

  return {
    room,
    players: players ?? [],
    cards: cards ?? [],
    events: events ?? [],
    remaining: remaining ?? 0,
    meId: me?.id ?? null,
  };
}

export async function nowPlaying(input: { code: string }) {
  const room = await loadRoom(input.code);

  if (!room.current_track_id) {
    return { trackId: null, previewUrl: null };
  }

  const track = trackById(room.current_track_id);

  if (!track) {
    return { trackId: room.current_track_id, previewUrl: null };
  }

  const match = await findPreview(track.artist, track.title);

  return {
    trackId: track.id,
    previewUrl: match.previewUrl,
    confident: match.confident,
  };
}

export async function skipTrack(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (room.turn_player_id !== me.id) {
    throw new ServiceError("não é a sua vez", 409);
  }

  if (!room.current_track_id) {
    throw new ServiceError("nenhuma música está tocando", 409);
  }

  await client
    .from("vt_rooms")
    .update({ current_track_id: null, current_started_at: null })
    .eq("id", room.id);

  await record({ roomId: room.id, type: "TRACK_SKIPPED", actorId: me.id });

  return { skipped: true };
}

export async function spendTokens(input: { code: string; token: string }) {
  const client = serverClient();
  const room = await loadRoom(input.code);
  const me = await loadPlayer(room, input.token);

  if (room.phase !== RoomPhase.Playing) {
    throw new ServiceError("a partida não está em andamento", 409);
  }

  if (me.tokens < room.token_cost) {
    throw new ServiceError(
      `você precisa de ${room.token_cost} fichas e tem ${me.tokens}`,
      409,
    );
  }

  const { data: top } = await client
    .from("vt_draw_pile")
    .select("track_id")
    .eq("room_id", room.id)
    .order("position")
    .limit(1)
    .maybeSingle();

  if (!top) {
    return finishByPileOut(room.id);
  }

  const track = trackById(top.track_id as string);

  if (!track) {
    throw new ServiceError("faixa desconhecida", 500);
  }

  await client
    .from("vt_draw_pile")
    .delete()
    .eq("room_id", room.id)
    .eq("track_id", track.id);

  await client.from("vt_timeline_cards").insert({
    room_id: room.id,
    player_id: me.id,
    track_id: track.id,
    year: track.year,
  });

  await client
    .from("vt_players")
    .update({ tokens: me.tokens - room.token_cost })
    .eq("id", me.id);

  await client.rpc("vt_sync_counts", { p_player: me.id });

  await record({
    roomId: room.id,
    type: "TOKENS_SPENT",
    actorId: me.id,
    trackId: track.id,
    detail: `trocou ${room.token_cost} fichas por ${track.artist} — ${track.title}, de ${track.year}`,
  });

  const { data: refreshed } = await client
    .from("vt_players")
    .select("id, timeline_count")
    .eq("id", me.id)
    .single();

  if ((refreshed?.timeline_count as number) >= room.target_cards) {
    await client
      .from("vt_rooms")
      .update({
        phase: RoomPhase.Finished,
        winner_player_id: me.id,
        finished_at: new Date().toISOString(),
        current_track_id: null,
      })
      .eq("id", room.id);

    await record({ roomId: room.id, type: "MATCH_WON", actorId: me.id });
  }

  return { track: { artist: track.artist, title: track.title, year: track.year } };
}
