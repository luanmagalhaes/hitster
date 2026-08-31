export interface DeezerMatch {
  previewUrl: string | null;
  matchedArtist: string | null;
  matchedTitle: string | null;
  confident: boolean;
}

interface DeezerTrack {
  title?: string;
  preview?: string;
  rank?: number;
  artist?: { name?: string };
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/\b(feat|ft|part|pt|remaster(ed)?|ao vivo|live|version|versao|radio edit|single)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function similar(a: string, b: string): boolean {
  const left = normalize(a);
  const right = normalize(b);

  if (!left || !right) {
    return false;
  }

  return left === right || left.includes(right) || right.includes(left);
}

async function search(query: string): Promise<DeezerTrack[]> {
  const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=15`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return [];
  }

  const payload = (await response.json()) as { data?: DeezerTrack[] };

  return payload.data ?? [];
}

export async function findPreview(artist: string, title: string): Promise<DeezerMatch> {
  const queries = [`artist:"${artist}" track:"${title}"`, `${artist} ${title}`, title];

  for (const query of queries) {
    const results = await search(query);

    const matches = results
      .filter((track) => track.preview)
      .filter(
        (track) =>
          similar(track.artist?.name ?? "", artist) && similar(track.title ?? "", title),
      )
      .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));

    const best = matches[0];

    if (best) {
      return {
        previewUrl: best.preview ?? null,
        matchedArtist: best.artist?.name ?? null,
        matchedTitle: best.title ?? null,
        confident: true,
      };
    }
  }

  return { previewUrl: null, matchedArtist: null, matchedTitle: null, confident: false };
}

export function answerMatches(guess: string, truth: string): boolean {
  const left = normalize(guess);
  const right = normalize(truth);

  if (!left || left.length < 3) {
    return false;
  }

  if (left === right) {
    return true;
  }

  const rightWords = right.split(" ").filter((word) => word.length > 2);
  const leftWords = left.split(" ").filter((word) => word.length > 2);

  if (rightWords.length === 0 || leftWords.length === 0) {
    return right.includes(left) || left.includes(right);
  }

  const covered = leftWords.filter((word) =>
    rightWords.some((target) => target === word || target.startsWith(word) || word.startsWith(target)),
  );

  if (covered.length === leftWords.length && covered.some((word) => word.length >= 4)) {
    return true;
  }

  const hits = rightWords.filter((word) =>
    leftWords.some((given) => given === word || word.startsWith(given) || given.startsWith(word)),
  ).length;

  return hits / rightWords.length >= 0.6;
}
