"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearSession,
  saveSession,
  serverSessionSnapshot,
  sessionSnapshot,
  subscribeSession,
  type Session,
} from "@/lib/session";

export type { Session };

export function useSession() {
  const session = useSyncExternalStore(subscribeSession, sessionSnapshot, serverSessionSnapshot);

  return {
    session,
    save: useCallback((next: Session) => saveSession(next), []),
    clear: useCallback(() => clearSession(), []),
  };
}
