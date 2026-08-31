const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const agent = "Vitrola/0.1 ( https://github.com/luanmagalhaes )";

function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function score(candidate, wanted) {
  const a = normalize(candidate);
  const b = normalize(wanted);

  if (a === b) return 3;
  if (a.startsWith(b) || b.startsWith(a)) return 2;
  if (a.includes(b) || b.includes(a)) return 1;

  return 0;
}

export async function musicbrainzYear(artist, title) {
  const query = encodeURIComponent(`artist:"${artist}" AND recording:"${title}"`);
  const url = `https://musicbrainz.org/ws/2/recording?query=${query}&fmt=json&limit=25`;
  const response = await fetch(url, { headers: { "User-Agent": agent } });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const years = [];

  for (const rec of payload.recordings ?? []) {
    const artistName = rec["artist-credit"]?.[0]?.name ?? "";

    if (score(artistName, artist) === 0 || score(rec.title ?? "", title) === 0) {
      continue;
    }

    const dates = [rec["first-release-date"]];

    for (const release of rec.releases ?? []) {
      dates.push(release.date);
      dates.push(release["release-group"]?.["first-release-date"]);
    }

    for (const date of dates) {
      const year = Number(String(date ?? "").slice(0, 4));

      if (year >= 1900 && year <= new Date().getFullYear()) {
        years.push(year);
      }
    }
  }

  await sleep(1100);

  return years.length ? Math.min(...years) : null;
}
