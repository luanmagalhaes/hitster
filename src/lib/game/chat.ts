import { serverClient } from "@/lib/supabase/server";
import { ServiceError } from "@/lib/game/service";
import type { ChatMessage } from "@/types/room";

export const maxMessageLength = 280;
export const maxAudioSeconds = 60;
export const maxAudioBytes = 2 * 1024 * 1024;
export const chatPageSize = 60;

const audioTypes: Record<string, string> = {
  "audio/webm": "webm",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

export function baseMime(mime: string): string {
  return mime.split(";")[0].trim().toLowerCase();
}

export function extensionFor(mime: string): string | null {
  return audioTypes[baseMime(mime)] ?? null;
}

export function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function listMessages(roomId: string): Promise<ChatMessage[]> {
  const { data } = await serverClient()
    .from("vt_messages")
    .select("id, player_id, author_name, kind, body, audio_path, audio_seconds, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(chatPageSize);

  return ((data ?? []) as ChatMessage[]).reverse();
}

export async function saveText(input: {
  roomId: string;
  playerId: string;
  authorName: string;
  body: string;
}): Promise<ChatMessage> {
  const body = cleanText(input.body);

  if (body.length === 0) {
    throw new ServiceError("Escreva alguma coisa antes de enviar", 422);
  }

  if (body.length > maxMessageLength) {
    throw new ServiceError(`A mensagem pode ter no máximo ${maxMessageLength} letras`, 422);
  }

  const { data, error } = await serverClient()
    .from("vt_messages")
    .insert({
      room_id: input.roomId,
      player_id: input.playerId,
      author_name: input.authorName,
      kind: "TEXT",
      body,
    })
    .select("id, player_id, author_name, kind, body, audio_path, audio_seconds, created_at")
    .single();

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  return data as ChatMessage;
}

export async function saveAudio(input: {
  roomId: string;
  playerId: string;
  authorName: string;
  bytes: ArrayBuffer;
  mime: string;
  seconds: number;
}): Promise<ChatMessage> {
  const extension = extensionFor(input.mime);

  if (!extension) {
    throw new ServiceError("Esse formato de áudio não é aceito", 415);
  }

  if (input.bytes.byteLength > maxAudioBytes) {
    throw new ServiceError("O áudio ficou grande demais, grave um mais curto", 413);
  }

  if (input.seconds > maxAudioSeconds) {
    throw new ServiceError(`O áudio pode ter no máximo ${maxAudioSeconds} segundos`, 422);
  }

  const client = serverClient();
  const path = `${input.roomId}/${crypto.randomUUID()}.${extension}`;
  const { error: sendError } = await client.storage
    .from("vt-audio")
    .upload(path, input.bytes, { contentType: baseMime(input.mime), upsert: false });

  if (sendError) {
    throw new ServiceError("Não consegui guardar esse áudio", 500);
  }

  const { data: published } = client.storage.from("vt-audio").getPublicUrl(path);
  const { data, error } = await client
    .from("vt_messages")
    .insert({
      room_id: input.roomId,
      player_id: input.playerId,
      author_name: input.authorName,
      kind: "AUDIO",
      audio_path: published.publicUrl,
      audio_seconds: Math.max(1, Math.round(input.seconds)),
    })
    .select("id, player_id, author_name, kind, body, audio_path, audio_seconds, created_at")
    .single();

  if (error) {
    throw new ServiceError(error.message, 500);
  }

  return data as ChatMessage;
}

export async function wipeChat(roomId: string): Promise<number> {
  const client = serverClient();
  const { data: rows } = await client
    .from("vt_messages")
    .select("audio_path")
    .eq("room_id", roomId)
    .eq("kind", "AUDIO");

  const paths = (rows ?? [])
    .map((row) => {
      const url = String(row.audio_path ?? "");
      const at = url.indexOf("/vt-audio/");

      return at === -1 ? null : url.slice(at + "/vt-audio/".length);
    })
    .filter((path): path is string => Boolean(path));

  if (paths.length > 0) {
    await client.storage
      .from("vt-audio")
      .remove(paths)
      .catch(() => undefined);
  }

  await client.from("vt_messages").delete().eq("room_id", roomId);

  return paths.length;
}
