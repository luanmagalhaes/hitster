import { handle, playerToken } from "@/app/api/_shared";
import { submitGuess } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();

    return submitGuess({
      code,
      token: playerToken(request),
      slotIndex: Number(body.slotIndex),
      artistGuess: typeof body.artistGuess === "string" ? body.artistGuess : undefined,
      titleGuess: typeof body.titleGuess === "string" ? body.titleGuess : undefined,
    });
  });
}
