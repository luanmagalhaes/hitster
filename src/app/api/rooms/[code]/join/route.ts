import { handle } from "@/app/api/_shared";
import { joinRoom } from "@/lib/game/service";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  return handle(async () => {
    const { code } = await context.params;
    const body = await request.json();

    return joinRoom({ code, name: String(body.name ?? "") });
  });
}
