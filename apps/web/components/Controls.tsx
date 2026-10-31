"use client";
const SPEEDS = [0.5, 1, 2, 5];
export function Controls({ paused, speed, disabled, onPlay, onPause, onStep, onReset, onSpeed }: { paused: boolean; speed: number; disabled: boolean; onPlay: () => void; onPause: () => void; onStep: () => void; onReset: () => void; onSpeed: (s: number) => void }) {
  return <div className="controls" aria-label="Demo controls">
    <button className="primary" disabled={disabled} onClick={paused ? onPlay : onPause}>{paused ? "Play" : "Pause"}</button>
    <button disabled={disabled || !paused} onClick={onStep}>Step · 0.5 base s</button>
    <button disabled={disabled} onClick={onReset}>Reset demo</button>
    <div className="speed-controls" role="group" aria-label="Playback speed"><span>Speed</span>{SPEEDS.map((s) => <button key={s} disabled={disabled} onClick={() => onSpeed(s)} aria-pressed={speed === s}>{s}×</button>)}</div>
    <span className="hint">Reset clears this demo’s events and returns it to its initial state.</span>
  </div>;
}
