import { handle } from "@/app/api/_shared";
import { expireSteal, skipIdleTurn } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const steal = await expireSteal({ code });

    if (steal.expired) {
      return { skipped: false as const, stealExpired: true as const };
    }

    return skipIdleTurn({ code });
  });
}
