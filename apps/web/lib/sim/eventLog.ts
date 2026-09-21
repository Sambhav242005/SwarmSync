import type { SimEvent } from "./types";
export class EventLog {
  private ev: SimEvent[] = [];
  append(e: SimEvent) { this.ev.push(e); }
  all(): SimEvent[] { return [...this.ev]; }
  up_to(t: number): SimEvent[] { return this.ev.filter((e) => e.sim_time <= t + 1e-9); }
  clear() { this.ev = []; }
}
