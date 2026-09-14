"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface Spot {
  x: number;
  y: number;
}

export function useDraggable(initial: Spot) {
  const [spot, setSpot] = useState<Spot>(initial);
  const dragging = useRef(false);
  const grab = useRef<Spot>({ x: 0, y: 0 });
  const size = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const clamp = useCallback((next: Spot): Spot => {
    const width = size.current.width || 280;
    const height = size.current.height || 200;
    const maxX = Math.max(8, window.innerWidth - width - 8);
    const maxY = Math.max(8, window.innerHeight - height - 8);

    return {
      x: Math.min(maxX, Math.max(8, next.x)),
      y: Math.min(maxY, Math.max(8, next.y)),
    };
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const box = event.currentTarget.closest("[data-drag-root]") as HTMLElement | null;

      if (!box) {
        return;
      }

      const rect = box.getBoundingClientRect();

      size.current = { width: rect.width, height: rect.height };
      grab.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      dragging.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!dragging.current) {
        return;
      }

      setSpot(clamp({ x: event.clientX - grab.current.x, y: event.clientY - grab.current.y }));
    },
    [clamp],
  );

  const onPointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    dragging.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  useEffect(() => {
    const settle = () => setSpot((current) => clamp(current));

    window.addEventListener("resize", settle);

    return () => window.removeEventListener("resize", settle);
  }, [clamp]);

  return { spot, handles: { onPointerDown, onPointerMove, onPointerUp } };
}
