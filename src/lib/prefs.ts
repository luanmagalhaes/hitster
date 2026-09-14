const tutorialKey = "vitrola.tutorial";
const listeners = new Set<() => void>();

interface Prefs {
  tutorialSeen: boolean;
}

const serverPrefs: Prefs = { tutorialSeen: true };

let cached: Prefs = serverPrefs;
let cachedRaw = "";

export function subscribePrefs(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function prefsSnapshot(): Prefs {
  let seen = true;

  try {
    seen = window.localStorage.getItem(tutorialKey) === "1";
  } catch {
    seen = true;
  }

  const raw = String(seen);

  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = { tutorialSeen: seen };
  }

  return cached;
}

export function serverPrefsSnapshot(): Prefs {
  return serverPrefs;
}

export function rememberTutorialSeen() {
  try {
    window.localStorage.setItem(tutorialKey, "1");
  } catch {
    return;
  }

  listeners.forEach((listener) => listener());
}
