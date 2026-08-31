import { readFileSync, writeFileSync } from "node:fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function looksLike(candidate, wanted) {
  const a = normalize(candidate);
  const b = normalize(wanted);

  return a.includes(b) || b.includes(a);
}

async function deezerSearch(artist, title) {
  const query = encodeURIComponent(`artist:"${artist}" track:"${title}"`);
  const response = await fetch(`https://api.deezer.com/search?q=${query}&limit=8`);

  if (!response.ok) {
    return [];
  }

  const payload = await response.json();

  return (payload.data ?? []).filter(
    (track) => looksLike(track.artist.name, artist) && looksLike(track.title, title),
  );
}

async function trackDetail(id) {
  const response = await fetch(`https://api.deezer.com/track/${id}`);

  return response.ok ? response.json() : null;
}

async function resolveOne(entry) {
  const matches = await deezerSearch(entry.artist, entry.title);

  if (matches.length === 0) {
    return { ...entry, status: "NAO_ENCONTRADO" };
  }

  let best = null;
  let earliest = null;

  for (const match of matches.slice(0, 4)) {
    const detail = await trackDetail(match.id);

    await sleep(120);

    if (!detail) {
      continue;
    }

    const dates = [detail.release_date, detail.album?.release_date].filter(Boolean);
    const years = dates.map((d) => Number(String(d).slice(0, 4))).filter((y) => y > 1900);
    const year = years.length ? Math.min(...years) : null;

    if (!best || (match.rank ?? 0) > (best.rank ?? 0)) {
      best = { id: detail.id, rank: match.rank, artist: detail.artist.name, title: detail.title };
    }

    if (year && (earliest === null || year < earliest)) {
      earliest = year;
    }
  }

  if (!best) {
    return { ...entry, status: "NAO_ENCONTRADO" };
  }

  const drift = earliest === null ? null : Math.abs(earliest - entry.year);

  return {
    ...entry,
    deezerId: best.id,
    deezerArtist: best.artist,
    deezerTitle: best.title,
    apiYear: earliest,
    drift,
    status: drift === null ? "SEM_ANO_API" : drift <= 2 ? "OK" : "REVISAR",
  };
}

const input = JSON.parse(readFileSync(process.argv[2], "utf8"));
const out = [];

for (const [index, entry] of input.entries()) {
  const result = await resolveOne(entry);

  out.push(result);
  process.stdout.write(
    `${String(index + 1).padStart(3)}/${input.length} ${result.status.padEnd(14)} ${entry.year} ${
      result.apiYear ?? "-"
    } ${entry.artist} - ${entry.title}\n`,
  );
  await sleep(180);
}

writeFileSync(process.argv[3], JSON.stringify(out, null, 2));

const counts = out.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});

console.log("\nresumo:", counts);
