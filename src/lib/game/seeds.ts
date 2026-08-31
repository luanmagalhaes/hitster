import type { Track } from "@/types/track";
import type { RandomNumberGenerator } from "@/utils/shuffle";
import { shuffle, systemRng } from "@/utils/shuffle";

function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

export function pickSpreadSeeds(
  pool: readonly Track[],
  count: number,
  rng: RandomNumberGenerator = systemRng,
): Track[] {
  const byDecade = new Map<number, Track[]>();

  for (const track of pool) {
    const decade = decadeOf(track.year);
    const bucket = byDecade.get(decade);

    if (bucket) {
      bucket.push(track);
    } else {
      byDecade.set(decade, [track]);
    }
  }

  const minPerDecade = 4;
  const eligible = [...byDecade.entries()].filter(([, bucket]) => bucket.length >= minPerDecade);
  const source = eligible.length >= count ? eligible : [...byDecade.entries()];
  const chosen: Track[] = [];
  const remaining = new Map(source);

  while (chosen.length < count && remaining.size > 0) {
    const weights = [...remaining.entries()];
    const total = weights.reduce((sum, [, bucket]) => sum + bucket.length, 0);
    let target = rng() * total;
    let picked = weights[weights.length - 1][0];

    for (const [decade, bucket] of weights) {
      target -= bucket.length;

      if (target <= 0) {
        picked = decade;
        break;
      }
    }

    const bucket = remaining.get(picked);

    if (bucket && bucket.length > 0) {
      chosen.push(shuffle(bucket, rng)[0]);
    }

    remaining.delete(picked);
  }

  if (chosen.length < count) {
    const used = new Set(chosen.map((track) => track.id));

    for (const track of shuffle(pool, rng)) {
      if (chosen.length >= count) {
        break;
      }

      if (!used.has(track.id)) {
        chosen.push(track);
        used.add(track.id);
      }
    }
  }

  return chosen.slice(0, count).sort((a, b) => a.year - b.year);
}

export const difficultyPresets = {
  CLASSIC: { seedCards: 1, targetCards: 10, tokenCost: 3 },
  QUICK: { seedCards: 3, targetCards: 8, tokenCost: 3 },
  MARATHON: { seedCards: 5, targetCards: 12, tokenCost: 4 },
} as const;

export type Difficulty = keyof typeof difficultyPresets;
