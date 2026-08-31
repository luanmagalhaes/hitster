import { handle } from "@/app/api/_shared";
import { createRoom } from "@/lib/game/service";
import type { DeckKind } from "@/types/track";

const decks: DeckKind[] = ["NATIONAL", "INTERNATIONAL", "MIXED"];

export async function POST(request: Request) {
  return handle(async () => {
    const body = await request.json();
    const deck = decks.includes(body.deck) ? (body.deck as DeckKind) : "MIXED";

    return createRoom({ hostName: String(body.hostName ?? ""), deck });
  });
}
