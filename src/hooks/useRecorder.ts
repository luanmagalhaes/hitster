"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStage = "IDLE" | "RECORDING" | "REVIEW";

export interface Take {
  blob: Blob;
  url: string;
  seconds: number;
}

const preferred = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
const voiceBitrate = 24000;

function pickType(): string | undefined {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  return preferred.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useRecorder(maxSeconds: number) {
  const [stage, setStage] = useState<RecorderStage>("IDLE");
  const [take, setTake] = useState<Take | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);

  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const ticker = useRef(0);

  const stopTracks = useCallback(() => {
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
    recorder.current = null;
    window.clearInterval(ticker.current);
  }, []);

  useEffect(() => {
    return () => {
      stopTracks();

      if (take) {
        URL.revokeObjectURL(take.url);
      }
    };
  }, [stopTracks, take]);

  const discard = useCallback(() => {
    setTake((current) => {
      if (current) {
        URL.revokeObjectURL(current.url);
      }

      return null;
    });
    setStage("IDLE");
    setElapsed(0);
    setProblem(null);
  }, []);

  const stop = useCallback(() => {
    if (recorder.current && recorder.current.state === "recording") {
      recorder.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    setProblem(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setProblem("Este aparelho não deixa gravar áudio pelo navegador.");

      return;
    }

    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      setProblem("Preciso da permissão do microfone para gravar.");

      return;
    }

    const type = pickType();

    let machine: MediaRecorder;

    try {
      machine = new MediaRecorder(stream, {
        ...(type ? { mimeType: type } : {}),
        audioBitsPerSecond: voiceBitrate,
      });
    } catch {
      try {
        machine = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      } catch {
        stream.getTracks().forEach((track) => track.stop());
        setProblem("Não consegui iniciar a gravação neste aparelho.");

        return;
      }
    }

    chunks.current = [];
    recorder.current = machine;
    startedAt.current = Date.now();

    machine.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.current.push(event.data);
      }
    };

    machine.onstop = () => {
      const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      const blob = new Blob(chunks.current, { type: machine.mimeType || "audio/webm" });

      stopTracks();

      if (blob.size === 0) {
        setProblem("A gravação saiu vazia. Tente de novo.");
        setStage("IDLE");

        return;
      }

      setTake({ blob, url: URL.createObjectURL(blob), seconds });
      setStage("REVIEW");
    };

    machine.start();
    setStage("RECORDING");
    setElapsed(0);

    ticker.current = window.setInterval(() => {
      const passed = Math.round((Date.now() - startedAt.current) / 1000);

      setElapsed(passed);

      if (passed >= maxSeconds) {
        machine.stop();
      }
    }, 250);
  }, [maxSeconds, stopTracks]);

  return { stage, take, elapsed, problem, start, stop, discard };
}
