"use client";

import { useEffect, useRef, useState } from "react";

const graceMs = 8000;

export function useLiveVersion(version: string | undefined) {
  const firstSeen = useRef<string | null>(null);
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (!version) {
      return;
    }

    if (firstSeen.current === null) {
      firstSeen.current = version;

      return;
    }

    if (firstSeen.current !== version) {
      setStale(true);
    }
  }, [version]);

  useEffect(() => {
    if (!stale) {
      return;
    }

    const timer = window.setTimeout(() => window.location.reload(), graceMs);

    return () => window.clearTimeout(timer);
  }, [stale]);

  return { stale, reloadNow: () => window.location.reload() };
}
