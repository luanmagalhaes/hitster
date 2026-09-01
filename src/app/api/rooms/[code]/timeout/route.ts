import { handle } from "@/app/api/_shared";
import { skipIdleTurn } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return skipIdleTurn({ code });
  });
}
