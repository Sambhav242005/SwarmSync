# NextJS-Only Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port Python sim to TypeScript inside apps/web and delete all Python.

**Architecture:** Pure TS sim in `apps/web/lib/sim/`, App Router API routes with in-memory Map, JSON data under `apps/web/data/`, relative-fetch frontend client.

**Tech Stack:** Next 14.2, React 18.3, TypeScript 5.4, vitest (new), node:crypto sha256.

**Spec:** docs/superpowers/specs/2026-09-21-nextjs-port-design.md

## Global Constraints

- Node 20+, TypeScript strict, noEmit, ES2022 target.
- No new runtime deps except vitest dev dep.
- API JSON shapes identical to FastAPI (simulation_id, scenario_id, sim_time, events, topology, metrics).
- Error codes: 404 unknown sid, 400 bad seed/dt/scenario_id/speed/at.
- Determinism required within TS (same seed same log), NOT bit-identical to Python.
- Delete simulator/, shared/, tests/*.py, pyproject.toml, .pytest_cache/.

---

### Task 1: Scaffold sim core types + RNG + clock + event log

**Files:**
- Create: `apps/web/lib/sim/types.ts`
- Create: `apps/web/lib/sim/rng.ts`
- Create: `apps/web/lib/sim/clock.ts`
- Create: `apps/web/lib/sim/eventLog.ts`
- Create: `apps/web/vitest.config.ts`
- Modify: `apps/web/package.json`

**Interfaces:**
- Consumes: nothing.
- Produces: `SimEvent` type, `mulberry32(seed)`, `hashSeed(str)`, `Clock` class, `EventLog` class for Tasks 2-4.

- [ ] **Step 1: Add vitest dev dep**

Run: `npm i -D vitest` in `apps/web`
Expected: package.json devDependencies gains vitest.

- [ ] **Step 2: Write types.ts**

```typescript
export type SimEvent = {
  event_id: string;
  sim_time: number;
  type: string;
  source?: string | null;
  target?: string | null;
  payload: Record<string, unknown>;
  causality: string[];
};
export type Topology = {
  devices: { id: string; x: number; y: number; tier: string; battery: number; failed: boolean; ram_gb: number }[];
  agents: { id: string; device: string; role: string; state: string }[];
  pois: { poi_id: string; kind: string; x: number; y: number }[];
};
```

- [ ] **Step 3: Write rng.ts (mulberry32, NOT Python MT)**

```typescript
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 4: Write clock.ts + eventLog.ts**

```typescript
// clock.ts
const SPEEDS = [0.25, 0.5, 1, 2, 5, 10] as const;
export class Clock {
  sim_time = 0; speed = 1; paused = true;
  constructor(speed = 1) { this.setSpeed(speed); }
  setSpeed(s: number) { if (!(SPEEDS as readonly number[]).includes(s)) throw new Error(`invalid speed ${s}`); this.speed = s; }
  advance(dt: number) { if (!this.paused) this.sim_time += dt * this.speed; }
}
// eventLog.ts
import type { SimEvent } from "./types";
export class EventLog {
  private ev: SimEvent[] = [];
  append(e: SimEvent) { this.ev.push(e); }
  all(): SimEvent[] { return [...this.ev]; }
  up_to(t: number): SimEvent[] { return this.ev.filter((e) => e.sim_time <= t + 1e-9); }
  clear() { this.ev = []; }
}
```

- [ ] **Step 5: Write vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["lib/sim/**/*.test.ts", "app/api/**/*.test.ts"] } });
```

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/sim apps/web/vitest.config.ts apps/web/package.json
git commit -m "feat: scaffold TS sim core with vitest"
```

### Task 2: Agent + link + knowledge + inference + collector

**Files:**
- Create: `apps/web/lib/sim/agent.ts`
- Create: `apps/web/lib/sim/link.ts`
- Create: `apps/web/lib/sim/knowledge.ts`
- Create: `apps/web/lib/sim/inference.ts`
- Create: `apps/web/lib/sim/collector.ts`

**Interfaces:**
- Consumes: SimEvent, mulberry32 from Task 1.
- Produces: `Agent`, `linkUp`, `KnowledgeStore`, `runInference`, `Collector` for Tasks 3-4.

- [ ] **Step 1: Write failing test**

```typescript
// apps/web/lib/sim/core.test.ts
import { describe, expect, it } from "vitest";
import { Agent } from "./agent";
import { KnowledgeStore } from "./knowledge";
describe("core", () => {
  it("agent cycles", () => { const a = new Agent("x", "d"); expect(a.step()).toBe("PERCEIVE"); });
  it("knowledge dedupes", () => {
    const k = new KnowledgeStore();
    const item = { knowledge_id: "k1", content: { poi: "p", status: "damaged" }, confidence: 0.8, version: 0 };
    expect(k.insert(item)).toBe("inserted");
    expect(k.insert(item)).toBe("duplicate");
  });
});
```

- [ ] **Step 2: Run test, verify fail**

Run: `npx vitest run lib/sim/core.test.ts` in `apps/web`
Expected: FAIL missing modules.

- [ ] **Step 3: Write implementations (port of agent.py, link.py, store.py, runner.py, collector.py)**

```typescript
// agent.ts
export const STATES = ["IDLE","PERCEIVE","INFER","UPDATE_KNOWLEDGE","DECIDE_COMM","SHARE","WAIT","COLLABORATE","VALIDATE","COMPLETE"] as const;
export class Agent {
  state = "IDLE";
  constructor(public agent_id: string, public device_id: string, public role = "worker") {}
  step(): string { const i = STATES.indexOf(this.state as (typeof STATES)[number]); this.state = STATES[(i + 1) % STATES.length]; return this.state; }
}
// link.ts
export function linkUp(a: { x: number; y: number }, b: { x: number; y: number }, range_m: number): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) <= range_m;
}
// knowledge.ts
export type KItem = { knowledge_id: string; content: unknown; confidence: number; version: number };
export class KnowledgeStore {
  private latest = new Map<string, KItem>(); private hist = new Map<string, KItem[]>();
  insert(item: KItem): string {
    const cur = this.latest.get(item.knowledge_id);
    if (cur && JSON.stringify(cur.content) === JSON.stringify(item.content) && cur.confidence === item.confidence && cur.version === item.version) return "duplicate";
    const h = this.hist.get(item.knowledge_id) ?? []; h.push({ ...item }); this.hist.set(item.knowledge_id, h);
    this.latest.set(item.knowledge_id, { ...item });
    return cur ? "updated" : "inserted";
  }
  conflicts(): { knowledge_id: string; versions: KItem[] }[] {
    const out: { knowledge_id: string; versions: KItem[] }[] = [];
    for (const [kid, h] of this.hist) { if (new Set(h.map((x) => JSON.stringify(x.content))).size > 1) out.push({ knowledge_id: kid, versions: [...h] }); }
    return out;
  }
}
// inference.ts — deterministic, sha256(model_id) mixed into seed
import { createHash } from "node:crypto";
import { mulberry32 } from "./rng";
const QF: Record<string, number> = { FP32: 1.6, FP16: 1.2, INT8: 1.0, INT4: 0.8 };
const TF: Record<string, number> = { normal: 1.0, warm: 1.3, hot: 1.8 };
export function runInference(device: { cpu_score: number; gpu_score: number; npu_score: number; thermal_state?: string; battery_percent?: number }, model: { model_id: string; quantization?: string; base_latency_ms?: number; quality_score?: number; memory_requirement_mb?: number; energy_cost?: number }, complexity: number, seed = 0): { latency_ms: number; memory_mb: number; energy_mwh: number; quality: number; confidence: number } {
  const h = parseInt(createHash("sha256").update(model.model_id).digest("hex").slice(0, 8), 16) % 100000;
  const rng = mulberry32(seed + h);
  const q = QF[model.quantization ?? "INT8"] ?? 1; const t = TF[device.thermal_state ?? "normal"] ?? 1;
  const batt = (device.battery_percent ?? 100) < 20 ? 1.2 : 1;
  const cap = (device.cpu_score + device.gpu_score + device.npu_score) / 3;
  const base = model.base_latency_ms ?? 100;
  const latency_ms = Math.round(base * (1.2 - cap) * q * (1 + complexity) * t * batt * (0.95 + rng() * 0.1) * 100) / 100;
  const quality = Math.round(Math.min(1, Math.max(0, (model.quality_score ?? 0.5) * cap * (1 - complexity * 0.2) + (rng() - 0.5) * 0.05)) * 1000) / 1000;
  const energy_mwh = Math.round((model.energy_cost ?? 1) * (latency_ms / 1000) * 1000) / 1000;
  return { latency_ms, memory_mb: model.memory_requirement_mb ?? 100, energy_mwh, quality, confidence: quality };
}
// collector.ts
import type { SimEvent } from "./types";
export class Collector {
  messages = 0; bytes = 0; conflicts = 0; knowledge = 0; dupes = 0;
  ingest(events: SimEvent[]) {
    for (const e of events) {
      const t = e.type.toUpperCase();
      if (t === "KNOWLEDGE_SHARED") { this.messages++; this.bytes += Number((e.payload as { bytes?: number }).bytes ?? 0); this.knowledge++; }
      if (t === "CONFLICT" || t === "CONFLICT_DETECTED") this.conflicts++;
      if (t === "KNOWLEDGE_CREATED" && (e.payload as { deduped?: boolean }).deduped) this.dupes++;
    }
  }
  summary() { return { messages: this.messages, bytes: this.bytes, conflicts: this.conflicts, knowledge: this.knowledge, tasks_completed: 0, dupes: this.dupes, energy_mwh: 0, avg_confidence: 0, avg_latency_ms: 0 }; }
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npx vitest run lib/sim/core.test.ts` in `apps/web`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/sim
git commit -m "feat: port agent link knowledge inference collector to TS"
```

### Task 3: SwarmWorld port

**Files:**
- Create: `apps/web/lib/sim/swarm.ts`
- Create: `apps/web/data/earthquake-6.json` (copy), `apps/web/data/models.json`, `apps/web/data/android-tiers.json`
- Test: `apps/web/lib/sim/swarm.test.ts`

**Interfaces:**
- Consumes: Agent, KnowledgeStore, runInference, linkUp, mulberry32, SimEvent from Tasks 1-2.
- Produces: `SwarmWorld` class with `topology()`, `tick()`, `reset()` for Task 4.

- [ ] **Step 1: Copy data files**

Run: `mkdir -p apps/web/data; cp data/scenarios/earthquake-6.json apps/web/data/; cp data/model-profiles/models.json apps/web/data/; cp data/device-profiles/android-tiers.json apps/web/data/`
Expected: 3 JSON files under apps/web/data.

- [ ] **Step 2: Write failing swarm test (ports test_swarm_tick.py)**

```typescript
import { describe, expect, it } from "vitest";
import { Engine } from "./engine";
describe("swarm", () => {
  it("loads 6x6x6 topology", () => {
    const e = Engine.fromScenario(7);
    const t = e.topology();
    expect(t.devices.length).toBe(6); expect(t.agents.length).toBe(6); expect(t.pois.length).toBe(6);
  });
});
```

- [ ] **Step 3: Run, verify fail (Engine missing)**

Run: `npx vitest run lib/sim/swarm.test.ts` in `apps/web`
Expected: FAIL.

- [ ] **Step 4: Write swarm.ts (port simulator/scenarios/swarm.py lines 1-248, rng swapped)**

```typescript
// apps/web/lib/sim/swarm.ts
import { Agent } from "./agent";
import { KnowledgeStore } from "./knowledge";
import { runInference } from "./inference";
import { linkUp } from "./link";
import { mulberry32 } from "./rng";
import type { SimEvent } from "./types";
export const ROLE_MODELS: Record<string, string[]> = {
  vision_ocr: ["det_int8", "ocr_int8"], vision: ["det_int8"], small_llm: ["llm_int4"],
  ocr_reasoning: ["ocr_int8", "reason_int8"], embedding_validator: ["embed_int8"], coordinator: [],
};
export const VALIDATORS = ["embedding_validator", "coordinator"];
const TRUTH = ["damaged", "severe", "intact", "damaged", "severe", "intact"];
const FLIP: Record<string, string> = { damaged: "intact", intact: "damaged", severe: "intact" };
const TIER_ORDER = ["high_end", "upper_mid", "mid", "low_end", "mid", "upper_mid"];
const START_BATTERY = [95, 80, 70, 60, 50, 85];
export type Emit = (type: string, source: string | null, target: string | null, payload: Record<string, unknown>, causality?: string[]) => SimEvent;
export class SwarmWorld {
  devices: { id: string; x: number; y: number; tier: string; cpu_score: number; gpu_score: number; npu_score: number; ram_gb: number; battery: number; thermal_state: string; failed: boolean }[] = [];
  agents: Agent[] = [];
  constructor(public seed: number, public scenario: { devices: string[]; agents: { id: string; role: string }[]; network: { mode?: string; range_m?: number }; failures: { device: string; at: number; for: number }[]; pois: { poi_id: string; kind: string; x: number; y: number }[] }, public models: Record<string, { model_id: string; quantization?: string; base_latency_ms?: number; quality_score?: number; memory_requirement_mb?: number; energy_cost?: number }>, public tiers: Record<string, { profile_id: string; ram_gb: number; cpu_score: number; gpu_score: number; npu_score: number }>) { this.load(); }
  load() { /* circle layout r=22 cx=640 cy=360, jitter mulberry32(seed+999) uniform(-4,4), in_range via linkUp */ }
  reset() { /* clear store/pair_up/conflicts, reload */ }
  topology() { /* map devices/agents/pois, battery rounded */ return { devices: [], agents: [], pois: [] } as never; }
  tick(now: number, prev: number, tick_idx: number, emit: Emit): SimEvent[] {
    // failures device_failed/device_recovered, link flap intermittent (tick_idx+i+j)%4!==0,
    // agent FSM PERCEIVE task_started, INFER runInference battery-=energy*0.5,
    // UPDATE_KNOWLEDGE insert knowledge_created, SHARE knowledge_shared peer lowest idx,
    // VALIDATE conflict_detected + knowledge_validated, COMPLETE task_completed
    return [];
  }
}
```

Full logic mirrors `simulator/scenarios/swarm.py` tick-for-tick. Only RNG changes: `random.Random(seed+999).uniform(-4,4)` -> `mulberry32(seed+999)()*8-4`, inference seed `seed*100000+tick*10+i` unchanged.

- [ ] **Step 5: Run swarm test, verify pass after Task 4 Engine exists (may fail until Task 4, commit together if needed)**

Run: `npx vitest run lib/sim/swarm.test.ts` in `apps/web`
Expected: PASS after Engine lands.

- [ ] **Step 6: Commit**

```bash
git add apps/web/lib/sim/swarm.ts apps/web/data apps/web/lib/sim/swarm.test.ts
git commit -m "feat: port SwarmWorld with scenario data"
```

### Task 4: Engine + in-memory store

**Files:**
- Create: `apps/web/lib/sim/engine.ts`
- Create: `apps/web/lib/sim/store.ts`
- Test: extend `apps/web/lib/sim/swarm.test.ts` with determinism, markers, failure, battery tests.

**Interfaces:**
- Consumes: SwarmWorld, Clock, EventLog from Tasks 1-3.
- Produces: `Engine` (load/tick/step/reset/rebuild/topology/setSpeed), `getStore()` Map for Task 5 routes.

- [ ] **Step 1: Write engine.ts (port of simulator/core/engine.py)**

```typescript
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
// store.ts
import { Engine } from "./engine";
const sims = new Map<string, Engine>();
export const simStore = { get: (sid: string) => sims.get(sid), set: (sid: string, e: Engine) => sims.set(sid, e) };
```

- [ ] **Step 2: Extend swarm.test.ts with ports of all 5 test_swarm_tick tests (markers, same-seed, failure/conflict/completion, battery)**

- [ ] **Step 3: Run**

Run: `npx vitest run lib/sim` in `apps/web`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/lib/sim/engine.ts apps/web/lib/sim/store.ts apps/web/lib/sim/swarm.test.ts
git commit -m "feat: add TS Engine with deterministic tick"
```

### Task 5: API routes

**Files:**
- Create: `apps/web/app/api/simulation/create/route.ts`, `start/route.ts`, `pause/route.ts`, `reset/route.ts`, `step/route.ts`, `speed/route.ts`, `state/route.ts`, `[sid]/events/route.ts`, `[sid]/topology/route.ts`, `[sid]/metrics/route.ts`
- Test: `apps/web/app/api/simulation/api.test.ts`

**Interfaces:**
- Consumes: Engine, simStore, Collector from Tasks 1-4.
- Produces: HTTP JSON identical to FastAPI for Task 6 client.

- [ ] **Step 1: Write route handlers (example create + step, rest same pattern)**

```typescript
// create/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Engine } from "@/lib/sim/engine";
import { simStore } from "@/lib/sim/store";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const seed = body.seed ?? 0;
  if (!Number.isInteger(seed)) return NextResponse.json({ detail: "seed must be int" }, { status: 400 });
  const scenario_id = body.scenario_id ?? "earthquake_response";
  if (scenario_id !== "earthquake_response") return NextResponse.json({ detail: `unknown scenario_id ${scenario_id}` }, { status: 400 });
  const sid = `sim_${randomUUID().replace(/-/g, "").slice(0, 6)}`;
  const eng = Engine.fromScenario(seed);
  simStore.set(sid, eng);
  return NextResponse.json({ simulation_id: sid, scenario_id });
}
// step/route.ts
import { NextResponse } from "next/server";
import { simStore } from "@/lib/sim/store";
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const eng = simStore.get(body.simulation_id ?? "");
  if (!eng) return NextResponse.json({ detail: "unknown simulation" }, { status: 404 });
  const dt = Number(body.dt ?? 0.5);
  if (!Number.isFinite(dt) || dt <= 0) return NextResponse.json({ detail: "dt must be >0" }, { status: 400 });
  const out = eng.step(dt);
  return NextResponse.json({ sim_time: eng.clock.sim_time, events: out });
}
```

Remaining routes: start/pause call eng.start/pause return {ok:true}; reset validates seed int-or-undefined; speed validates [0.25,0.5,1,2,5,10] else 400; state GET ?simulation_id&at validates at>=0 returns rebuild; [sid]/events returns log.all(); [sid]/topology returns topology(); [sid]/metrics ingests log, adds tasks_completed + sim_time.

- [ ] **Step 2: Write api.test.ts porting test_api.py (create+step, 404, 400 seed/dt, topology, state at/speed/metrics)**

Use `POST` handler invocation or fetch against `next start`. Simplest: unit-test Engine + route functions directly via vitest.

- [ ] **Step 3: Run**

Run: `npx vitest run app/api` in `apps/web`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/api
git commit -m "feat: add Next API routes for simulation"
```

### Task 6: Frontend client + delete Python

**Files:**
- Modify: `apps/web/lib/api.ts`
- Delete: `simulator/`, `shared/`, `tests/`, `pyproject.toml`, `.pytest_cache/`, `data/` (moved), root `experiments/` if empty.

**Interfaces:**
- Consumes: routes from Task 5.
- Produces: single-deploy web app.

- [ ] **Step 1: Rewrite lib/api.ts to relative fetch**

```typescript
const BASE = "";
async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}/api${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`POST ${path} failed: ${r.status}`);
  return r.json() as Promise<T>;
}
async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}/api${path}`);
  if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`);
  return r.json() as Promise<T>;
}
export async function createSimulation(seed = 0, scenario_id = "earthquake_response") { return post<{ simulation_id: string; scenario_id: string }>("/simulation/create", { seed, scenario_id }); }
// ... keep all other exports same shape, prefix /simulation/*, drop connectSimulationWs, add:
export async function pollState(simulation_id: string, at?: number) { const q = at === undefined ? "" : `&at=${at}`; return get<{ sim_time: number; events: SimEvent[] }>(`/simulation/state?simulation_id=${simulation_id}${q}`); }
```

- [ ] **Step 2: Delete Python**

Run: `git rm -r simulator shared tests pyproject.toml; rm -rf .pytest_cache .serena; git status --short`
Expected: only apps/web + docs + apps/web/data remain.

- [ ] **Step 3: Verify**

Run: `npx vitest run` in `apps/web`
Run: `npm run typecheck` in `apps/web`
Run: `npm run build` in `apps/web`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: NextJS-only port, remove Python backend"
```
