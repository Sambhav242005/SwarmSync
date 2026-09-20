export type Lens = "WORLD" | "NETWORK" | "KNOWLEDGE" | "MODEL" | "RESOURCE";

const LENSES: Lens[] = ["WORLD", "NETWORK", "KNOWLEDGE", "MODEL", "RESOURCE"];

export function Lenses({
  lens,
  onChange,
}: {
  lens: Lens;
  onChange: (l: Lens) => void;
}) {
  return (
    <nav aria-label="lenses" className="flex gap-1 px-4 py-1 bg-neutral-950 text-neutral-100">
      {LENSES.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          aria-pressed={lens === l}
          className={
            lens === l
              ? "px-2 py-1 text-xs font-bold bg-teal-500 text-black rounded"
              : "px-2 py-1 text-xs bg-neutral-800 text-neutral-200 rounded"
          }
        >
          {l}
        </button>
      ))}
    </nav>
  );
}
