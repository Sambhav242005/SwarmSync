import type { SimEvent } from "../lib/sim/types";
export function Timeline({ events, onSelect }: { events: SimEvent[]; onSelect: (id: string) => void }) {
  return <section className="timeline" aria-labelledby="event-heading"><h2 id="event-heading">Recent events</h2><p>Live event log only. Historical world replay is unavailable.</p>{events.length === 0 ? <p>No events yet. Step or play to advance the demo.</p> : <ol>{events.slice(-20).reverse().map((event) => <li key={event.event_id}><button onClick={() => onSelect(event.event_id)}>{event.sim_time.toFixed(2)}s · {event.type} · {event.event_id}</button></li>)}</ol>}</section>;
}
