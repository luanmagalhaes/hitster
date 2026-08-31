export interface Session {
  code: string;
  playerId: string;
  accessToken: string;
  name: string;
}

const key = "vitrola.session";
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cached: Session | null = null;
let bootstrapped = false;

function bootstrap() {
  if (bootstrapped || typeof window === "undefined") {
    return;
  }

  bootstrapped = true;

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const token = params.get("token");

  if (code && token && process.env.NODE_ENV !== "production") {
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          code: code.toUpperCase(),
          playerId: "",
          accessToken: token,
          name: params.get("name") ?? "Jogador",
        }),
      );
    } catch {
      return;
    } finally {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function sessionSnapshot(): Session | null {
  bootstrap();

  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }

  if (raw !== cachedRaw) {
    cachedRaw = raw;

    try {
      const parsed = raw ? (JSON.parse(raw) as Session) : null;

      cached = parsed?.code && parsed.accessToken ? parsed : null;
    } catch {
      cached = null;
    }
  }

  return cached;
}

export function serverSessionSnapshot(): Session | null {
  return null;
}

export function saveSession(next: Session) {
  try {
    window.localStorage.setItem(key, JSON.stringify(next));
  } catch {
    return;
  }

  listeners.forEach((listener) => listener());
}

export function clearSession() {
  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }

  listeners.forEach((listener) => listener());
}
