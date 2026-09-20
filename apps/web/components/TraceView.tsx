import { useMemo } from "react";
import type { SimEvent } from "../../../shared/types/events";

/** Render-only causal chain derived from event.causality links. No invented edges. */
export function TraceView({
  events,
  focusId,
}: {
  events: SimEvent[];
  focusId: string | null;
}) {
  const chain = useMemo(() => {
    if (!focusId) return [];
    const byId = new Map(events.map((e) => [e.event_id, e]));
    const root = byId.get(focusId);
    if (root) {
      // Walk ancestors via causality only.
      const seen = new Set<string>();
      const out: SimEvent[] = [];
      const stack: string[] = [...root.causality];
      while (stack.length) {
        const id = stack.pop() as string;
        if (seen.has(id)) continue;
        seen.add(id);
        const e = byId.get(id);
        if (e) {
          out.push(e);
          stack.push(...e.causality);
        }
      }
      out.sort((a, b) => a.sim_time - b.sim_time);
      return [...out, root];
    }
    // focusId is an entity (device/agent): show events touching it, with their real links.
    return events
      .filter((e) => e.source === focusId || e.target === focusId)
      .sort((a, b) => a.sim_time - b.sim_time);
  }, [events, focusId]);

  if (!focusId) return <p className="text-xs opacity-70">Select an event or entity to trace.</p>;
  if (chain.length === 0)
    return <p className="text-xs opacity-70">No causal chain for {focusId}.</p>;

  return (
    <ol className="flex flex-col gap-1 text-xs">
      {chain.map((e) => (
        <li key={e.event_id} className="border border-neutral-700 rounded px-2 py-1">
          <div className="font-mono font-bold">{e.event_id}</div>
          <div>
            {e.type} @ {e.sim_time.toFixed(2)}s
          </div>
          <div className="opacity-70">
            {e.source ?? "?"} → {e.target ?? "?"}
          </div>
          {e.causality.length > 0 && (
            <div className="opacity-70">caused by: {e.causality.join(", ")}</div>
          )}
        </li>
      ))}
    </ol>
  );
}
