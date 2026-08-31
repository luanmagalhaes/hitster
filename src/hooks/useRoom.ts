"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type RoomState } from "@/lib/api";

const pollMs = 2200;

export function useRoom(code: string | null, token: string | null) {
  const [state, setState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(code));

  const refresh = useCallback(async () => {
    if (!code) {
      return;
    }

    try {
      setState(await api.state(code, token ?? undefined));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "erro ao carregar a sala");
    } finally {
      setLoading(false);
    }
  }, [code, token]);

  useEffect(() => {
    if (!code) {
      return;
    }

    const tick = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, pollMs);

    document.addEventListener("visibilitychange", tick);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [code, refresh]);

  return { state, error, loading, refresh };
}
