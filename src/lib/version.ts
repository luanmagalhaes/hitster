const bootedAt = Date.now();

export function serverVersion(): string {
  return String(bootedAt);
}
