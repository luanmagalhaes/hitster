"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearSession,
  forgetSeat,
  recentSeats,
  saveSession,
  seatFor,
  serverSessionSnapshot,
  sessionSnapshot,
  subscribeSession,
  type RecentSeat,
  type Session,
} from "@/lib/session";

export type { RecentSeat, Session };

export function useSession() {
  const session = useSyncExternalStore(subscribeSession, sessionSnapshot, serverSessionSnapshot);

  return {
    session,
    save: useCallback((next: Session) => saveSession(next), []),
    clear: useCallback(() => clearSession(), []),
    seats: useCallback(() => recentSeats(), []),
    seatFor: useCallback((code: string, name: string) => seatFor(code, name), []),
    forget: useCallback((code: string) => forgetSeat(code), []),
  };
}
