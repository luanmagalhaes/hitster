"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AudioPlayerState {
  playing: boolean;
  elapsed: number;
  duration: number;
  blocked: boolean;
  ready: boolean;
}

export function useAudioPlayer(src: string | null) {
  const elementRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    playing: false,
    elapsed: 0,
    duration: 30,
    blocked: false,
    ready: false,
  });

  useEffect(() => {
    const element = new Audio();

    element.preload = "auto";
    elementRef.current = element;

    const onPlay = () => setState((current) => ({ ...current, playing: true, blocked: false }));
    const onPause = () => setState((current) => ({ ...current, playing: false }));
    const onEnded = () => setState((current) => ({ ...current, playing: false }));
    const onTime = () =>
      setState((current) => ({ ...current, elapsed: element.currentTime }));
    const onMeta = () =>
      setState((current) => ({
        ...current,
        ready: true,
        duration: Number.isFinite(element.duration) && element.duration > 0 ? element.duration : 30,
      }));

    element.addEventListener("play", onPlay);
    element.addEventListener("pause", onPause);
    element.addEventListener("ended", onEnded);
    element.addEventListener("timeupdate", onTime);
    element.addEventListener("loadedmetadata", onMeta);

    return () => {
      element.removeEventListener("play", onPlay);
      element.removeEventListener("pause", onPause);
      element.removeEventListener("ended", onEnded);
      element.removeEventListener("timeupdate", onTime);
      element.removeEventListener("loadedmetadata", onMeta);
      element.pause();
      element.src = "";
      elementRef.current = null;
    };
  }, []);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    if (!src) {
      element.pause();
      element.removeAttribute("src");

      return;
    }

    if (element.src === src) {
      return;
    }

    element.src = src;
    element.currentTime = 0;

    const attempt = element.play();

    if (attempt) {
      attempt.catch(() => setState((current) => ({ ...current, blocked: true })));
    }
  }, [src]);

  const toggle = useCallback(() => {
    const element = elementRef.current;

    if (!element || !element.src) {
      return;
    }

    if (element.paused) {
      const attempt = element.play();

      if (attempt) {
        attempt.catch(() => setState((current) => ({ ...current, blocked: true })));
      }
    } else {
      element.pause();
    }
  }, []);

  const restart = useCallback(() => {
    const element = elementRef.current;

    if (!element || !element.src) {
      return;
    }

    element.currentTime = 0;

    const attempt = element.play();

    if (attempt) {
      attempt.catch(() => setState((current) => ({ ...current, blocked: true })));
    }
  }, []);

  return { ...state, hasSource: Boolean(src), toggle, restart };
}
