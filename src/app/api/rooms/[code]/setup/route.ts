import { handle, playerToken } from "@/app/api/_shared";
import { updateSetup } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = (await request.json()) as {
      deck?: string;
      difficulty?: string;
      mode?: string;
    };

    return updateSetup({
      code,
      token: playerToken(request),
      deck: body.deck,
      difficulty: body.difficulty,
      mode: body.mode,
    });
  });
}
