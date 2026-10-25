"use client";

const SPEEDS = [0.5, 1, 2, 5];

export function Controls({
  paused,
  speed,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeed,
}: {
  paused: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeed: (s: number) => void;
}) {
  return (
    <div className="flex items-center gap-1 px-4 py-1 bg-neutral-950 text-neutral-100 border-t border-neutral-800 text-xs">
      {paused ? (
        <button onClick={onPlay} className="px-2 py-1 bg-teal-500 text-black font-bold rounded">PLAY</button>
      ) : (
        <button onClick={onPause} className="px-2 py-1 bg-neutral-800 rounded">PAUSE</button>
      )}
      <button onClick={onStep} className="px-2 py-1 bg-neutral-800 rounded">STEP</button>
      <button onClick={onReset} className="px-2 py-1 bg-neutral-800 rounded">RESET</button>
      <span className="opacity-60 ml-2">Speed:</span>
      {SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => onSpeed(s)}
          aria-pressed={speed === s}
          className={speed === s ? "px-2 py-1 font-bold bg-teal-500 text-black rounded" : "px-2 py-1 bg-neutral-800 rounded"}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
