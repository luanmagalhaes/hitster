"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  clearSession,
  forgetSeat,
  saveSession,
  seatFor,
  seatsSnapshot,
  serverSeatsSnapshot,
  serverSessionSnapshot,
  sessionSnapshot,
  subscribeSeats,
  subscribeSession,
  type RecentSeat,
  type Session,
} from "@/lib/session";

export type { RecentSeat, Session };

export function useSession() {
  const session = useSyncExternalStore(subscribeSession, sessionSnapshot, serverSessionSnapshot);
  const seats = useSyncExternalStore(subscribeSeats, seatsSnapshot, serverSeatsSnapshot);

  return {
    session,
    seats,
    save: useCallback((next: Session) => saveSession(next), []),
    clear: useCallback(() => clearSession(), []),
    seatFor: useCallback((code: string, name: string) => seatFor(code, name), []),
    forget: useCallback((code: string) => forgetSeat(code), []),
  };
}
