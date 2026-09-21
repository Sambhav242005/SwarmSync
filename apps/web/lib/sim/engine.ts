import { Clock } from "./clock";
import { EventLog } from "./eventLog";
import { SwarmWorld } from "./swarm";
import { mulberry32 } from "./rng";
import type { SimEvent } from "./types";
import scn from "../../data/earthquake-6.json";
import models from "../../data/models.json";
import tiers from "../../data/android-tiers.json";
type Scenario = ConstructorParameters<typeof SwarmWorld>[1];
type Models = ConstructorParameters<typeof SwarmWorld>[2];
type Tiers = ConstructorParameters<typeof SwarmWorld>[3];
export class Engine {
  seed; rng: () => number; clock = new Clock(1); log = new EventLog();
  private n = 0; world: SwarmWorld | null = null; private wtick = 0;
  constructor(seed = 0) { this.seed = seed; this.rng = mulberry32(seed); }
  static fromScenario(seed = 0) { const e = new Engine(seed); e.loadScenario(scn as Scenario, models as Models, tiers as Tiers); return e; }
  loadScenario(scenario: Scenario, m: Models, t: Tiers) { this.world = new SwarmWorld(this.seed, scenario, m, t); }
  topology() { return this.world ? this.world.topology() : { devices: [], agents: [], pois: [] }; }
  private emit(type: string, source: string | null, target: string | null, payload: Record<string, unknown>, causality: string[] = []): SimEvent {
    this.n++;
    const e: SimEvent = { event_id: `evt_${this.n}`, sim_time: Math.round(this.clock.sim_time * 100) / 100, type, source, target, payload, causality: causality.filter(Boolean) };
    this.log.append(e); return e;
  }
  start() { this.clock.paused = false; }
  pause() { this.clock.paused = true; }
  setSpeed(s: number) { this.clock.setSpeed(s); }
  reset(seed?: number) {
    if (seed !== undefined) this.seed = seed;
    this.rng = mulberry32(this.seed);
    this.log.clear(); this.n = 0; this.clock.sim_time = 0; this.clock.paused = true; this.wtick = 0;
    this.world?.reset();
  }
  tick(dt: number): SimEvent[] {
    const before = this.clock.sim_time; this.clock.advance(dt);
    if (this.clock.paused || this.clock.sim_time === before) return [];
    this.n++;
    const e: SimEvent = { event_id: `evt_${this.n}`, sim_time: Math.round(this.clock.sim_time * 100) / 100, type: "TICK", payload: { rng: this.rng() }, causality: [] };
    this.log.append(e);
    const out = [e];
    if (this.world) out.push(...this.world.tick(this.clock.sim_time, before, this.wtick, this.emit.bind(this)));
    this.wtick++;
    return out;
  }
  step(dt: number): SimEvent[] { const was = this.clock.paused; this.clock.paused = false; const out = this.tick(dt); this.clock.paused = was; return out; }
  rebuild(t: number) { return { sim_time: t, events: this.log.up_to(t) }; }
}
