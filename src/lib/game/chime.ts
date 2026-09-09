type ContextConstructor = typeof AudioContext;

let context: AudioContext | null = null;

function constructorFor(): ContextConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const scoped = window as Window & { webkitAudioContext?: ContextConstructor };

  return window.AudioContext ?? scoped.webkitAudioContext ?? null;
}

function contextFor(): AudioContext | null {
  if (context) {
    return context;
  }

  const Ctor = constructorFor();

  if (!Ctor) {
    return null;
  }

  try {
    context = new Ctor();
  } catch {
    return null;
  }

  return context;
}

export function unlockChime() {
  const audio = contextFor();

  if (audio && audio.state === "suspended") {
    void audio.resume().catch(() => undefined);
  }
}

const notes = [
  { hz: 659.25, at: 0, seconds: 0.1 },
  { hz: 987.77, at: 0.085, seconds: 0.22 },
];

export function playChime(): boolean {
  const audio = contextFor();

  if (!audio) {
    return false;
  }

  if (audio.state === "suspended") {
    void audio.resume().catch(() => undefined);
  }

  try {
    const start = audio.currentTime + 0.01;

    for (const note of notes) {
      const tone = audio.createOscillator();
      const level = audio.createGain();

      tone.type = "sine";
      tone.frequency.value = note.hz;

      const from = start + note.at;

      level.gain.setValueAtTime(0.0001, from);
      level.gain.exponentialRampToValueAtTime(0.14, from + 0.012);
      level.gain.exponentialRampToValueAtTime(0.0001, from + note.seconds);

      tone.connect(level);
      level.connect(audio.destination);
      tone.start(from);
      tone.stop(from + note.seconds + 0.02);
    }

    return true;
  } catch {
    return false;
  }
}
