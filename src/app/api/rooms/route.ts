import { handle } from "@/app/api/_shared";
import { createRoom } from "@/lib/game/service";
import type { Difficulty } from "@/lib/game/seeds";
import type { DeckKind } from "@/types/track";

const decks: DeckKind[] = ["NATIONAL", "INTERNATIONAL", "MIXED"];
const levels: Difficulty[] = ["EASY", "NORMAL", "HARD"];

export async function POST(request: Request) {
  return handle(async () => {
    const body = await request.json();
    const deck = decks.includes(body.deck) ? (body.deck as DeckKind) : "MIXED";
    const difficulty = levels.includes(body.difficulty)
      ? (body.difficulty as Difficulty)
      : "NORMAL";

    return createRoom({ hostName: String(body.hostName ?? ""), deck, difficulty });
  });
}
