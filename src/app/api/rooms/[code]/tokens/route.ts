import { handle, playerToken } from "@/app/api/_shared";
import { spendTokens } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;

    return spendTokens({ code, token: playerToken(request) });
  });
}
