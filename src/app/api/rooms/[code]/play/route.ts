import { handle, playerToken } from "@/app/api/_shared";
import { drawTrack, nowPlaying } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return drawTrack({ code, token: playerToken(request) });
  });
}

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return nowPlaying({ code });
  });
}
