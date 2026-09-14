import { handle, playerToken } from "@/app/api/_shared";
import { ServiceError, loadRoomForChat } from "@/lib/game/service";
import { listMessages, maxAudioBytes, saveAudio, saveText } from "@/lib/game/chat";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const { room } = await loadRoomForChat(code, playerToken(request));

    return { messages: await listMessages(room.id) };
  });
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const { room, player } = await loadRoomForChat(code, playerToken(request));
    const type = request.headers.get("content-type") ?? "";

    if (type.startsWith("audio/")) {
      const seconds = Number(request.headers.get("x-audio-seconds") ?? "0");
      const bytes = await request.arrayBuffer();

      if (bytes.byteLength === 0) {
        throw new ServiceError("O áudio chegou vazio, tente gravar de novo", 422);
      }

      if (bytes.byteLength > maxAudioBytes) {
        throw new ServiceError("O áudio ficou grande demais, grave um mais curto", 413);
      }

      return saveAudio({
        roomId: room.id,
        playerId: player.id,
        authorName: player.name,
        bytes,
        mime: type,
        seconds: Number.isFinite(seconds) ? seconds : 0,
      });
    }

    const body = await request.json().catch(() => ({}));

    return saveText({
      roomId: room.id,
      playerId: player.id,
      authorName: player.name,
      body: String(body.body ?? ""),
    });
  });
}
