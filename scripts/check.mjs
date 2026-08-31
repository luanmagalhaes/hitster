import { readFileSync } from "node:fs";
import { musicbrainzYear } from "./year.mjs";

const input = JSON.parse(readFileSync(process.argv[2], "utf8"));

for (const entry of input) {
  const year = await musicbrainzYear(entry.artist, entry.title);
  const drift = year === null ? null : Math.abs(year - entry.year);
  const status = year === null ? "SEM_DADO" : drift <= 1 ? "CONFIRMA" : "DIVERGE";

  console.log(
    `${status.padEnd(9)} meu=${entry.year} mb=${year ?? "-"} ${entry.artist} - ${entry.title}`,
  );
}
