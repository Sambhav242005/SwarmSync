import { Agent } from "./agent";
import { KnowledgeStore, type KItem } from "./knowledge";
import { runInference } from "./inference";
import { linkUp } from "./link";
import { mulberry32 } from "./rng";
import type { SimEvent, Topology } from "./types";

export const ROLE_MODELS: Record<string, string[]> = {
  vision_ocr: ["det_int8", "ocr_int8"],
  vision: ["det_int8"],
  small_llm: ["llm_int4"],
  ocr_reasoning: ["ocr_int8", "reason_int8"],
  embedding_validator: ["embed_int8"],
  coordinator: [],
};
export const VALIDATORS = ["embedding_validator", "coordinator"];

const TRUTH = ["damaged", "severe", "intact", "damaged", "severe", "intact"];
const FLIP: Record<string, string> = { damaged: "intact", intact: "damaged", severe: "intact" };
const TIER_ORDER = ["high_end", "upper_mid", "mid", "low_end", "mid", "upper_mid"];
const START_BATTERY = [95, 80, 70, 60, 50, 85];

export type Emit = (
  type: string,
  source: string | null,
  target: string | null,
  payload: Record<string, unknown>,
  causality?: string[]
) => SimEvent;

export type ScenarioInput = {
  devices: string[];
  agents: { id: string; role?: string }[];
  network?: { mode?: string; range_m?: number; [k: string]: unknown };
  failures?: { device: string; at: number; for: number }[];
  pois?: { poi_id: string; kind: string; x: number; y: number }[];
};

export type ModelInput = {
  model_id: string;
  quantization?: string;
  base_latency_ms?: number;
  quality_score?: number;
  memory_requirement_mb?: number;
  energy_cost?: number;
};

export type TierInput = {
  profile_id: string;
  ram_gb: number;
  cpu_score: number;
  gpu_score: number;
  npu_score: number;
};

type Device = {
  id: string;
  x: number;
  y: number;
  tier: string;
  cpu_score: number;
  gpu_score: number;
  npu_score: number;
  ram_gb: number;
  battery: number;
  battery_percent?: number;
  thermal_state: string;
  failed: boolean;
};

type Rt = {
  started: boolean;
  completed: boolean;
  infer: ({ model: string; confidence: number; energy_mwh: number } & Record<string, unknown>) | null;
  last: KItem | null;
  last_ev: string;
  unvalidated: string[];
  shared_ev?: string;
  task?: string;
};

function asModelMap(models: ModelInput[] | Record<string, ModelInput>): Record<string, ModelInput> {
  return Array.isArray(models)
    ? Object.fromEntries(models.map((m) => [m.model_id, m]))
    : models;
}

function asTierMap(tiers: TierInput[] | Record<string, TierInput>): Record<string, TierInput> {
  return Array.isArray(tiers)
    ? Object.fromEntries(tiers.map((t) => [t.profile_id, t]))
    : tiers;
}

export class SwarmWorld {
  devices: Device[] = [];
  agents: Agent[] = [];
  store = new KnowledgeStore();
  pair_up: Record<string, boolean> = {};
  emitted_conflicts = new Set<string>();
  rt: Record<string, Rt> = {};
  in_range: Record<string, boolean> = {};
  net: ScenarioInput["network"];
  failures: NonNullable<ScenarioInput["failures"]>;
  pois: NonNullable<ScenarioInput["pois"]>;
  models: Record<string, ModelInput>;
  tiers: Record<string, TierInput>;

  constructor(
    public seed: number,
    public scenario: ScenarioInput,
    models: ModelInput[] | Record<string, ModelInput>,
    tiers: TierInput[] | Record<string, TierInput>
  ) {
    this.models = asModelMap(models);
    this.tiers = asTierMap(tiers);
    this.net = scenario.network ?? {};
    this.failures = scenario.failures ?? [];
    this.pois = scenario.pois ?? [];
    this.load();
  }

  load(): void {
    const scn = this.scenario;
    const rng = mulberry32((this.seed + 999) >>> 0);
    const cx = 640.0;
    const cy = 360.0;
    const r = 22.0;
    const devIds = scn.devices ?? [];
    const n0 = Math.max(devIds.length, 1);
    devIds.forEach((dev_id, i) => {
      const tier = this.tiers[TIER_ORDER[i % TIER_ORDER.length]];
      const ang = i * ((2 * Math.PI) / n0);
      this.devices.push({
        id: dev_id,
        x: Math.round((cx + r * Math.cos(ang) + (rng() * 8 - 4)) * 10) / 10,
        y: Math.round((cy + r * Math.sin(ang) + (rng() * 8 - 4)) * 10) / 10,
        tier: tier.profile_id,
        cpu_score: tier.cpu_score,
        gpu_score: tier.gpu_score,
        npu_score: tier.npu_score,
        ram_gb: tier.ram_gb,
        battery: START_BATTERY[i % START_BATTERY.length],
        thermal_state: "normal",
        failed: false,
      });
    });
    (scn.agents ?? []).forEach((a, i) => {
      this.agents.push(
        new Agent(a.id, this.devices[i % this.devices.length].id, a.role ?? "worker")
      );
    });
    this.rt = Object.fromEntries(
      this.agents.map((a) => [
        a.agent_id,
        { started: false, completed: false, infer: null, last: null, last_ev: "", unvalidated: [] as string[] },
      ])
    );
    const n = this.devices.length;
    const range = Number(this.net?.range_m ?? 30);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        this.in_range[`${i},${j}`] = linkUp(this.devices[i], this.devices[j], range);
      }
    }
  }

  reset(): void {
    this.store = new KnowledgeStore();
    this.pair_up = {};
    this.emitted_conflicts = new Set();
    const scenario: ScenarioInput = {
      devices: this.devices.map((d) => d.id),
      agents: this.agents.map((a) => ({ id: a.agent_id, role: a.role })),
      network: this.net,
      failures: this.failures,
      pois: this.pois,
    };
    this.scenario = scenario;
    this.devices = [];
    this.agents = [];
    this.load();
    this.rt = Object.fromEntries(
      this.agents.map((a) => [
        a.agent_id,
        { started: false, completed: false, infer: null, last: null, last_ev: "", unvalidated: [] as string[] },
      ])
    );
  }

  topology(): Topology {
    return {
      devices: this.devices.map((d) => ({
        id: d.id,
        x: d.x,
        y: d.y,
        tier: d.tier,
        battery: Math.round(d.battery * 10) / 10,
        failed: d.failed,
        ram_gb: d.ram_gb,
      })),
      agents: this.agents.map((a) => ({
        id: a.agent_id,
        device: a.device_id,
        role: a.role,
        state: a.state,
      })),
      pois: this.pois,
    };
  }

  private failed(dev_id: string): boolean {
    return this.devices.find((d) => d.id === dev_id)?.failed ?? false;
  }

  tick(now: number, prev: number, tick_idx: number, emit: Emit): SimEvent[] {
    const out: SimEvent[] = [];
    for (const f of this.failures) {
      const dev = this.devices.find((d) => d.id === f.device);
      if (!dev) continue;
      if (prev < f.at && f.at <= now && !dev.failed) {
        dev.failed = true;
        out.push(emit("device_failed", dev.id, null, { device: dev.id, at: f.at }, []));
      }
      if (prev < f.at + f["for"] && f.at + f["for"] <= now && dev.failed) {
        dev.failed = false;
        out.push(emit("device_recovered", dev.id, null, { device: dev.id }, []));
      }
    }
    // link flap + discovery / loss
    const n = this.devices.length;
    const mode = this.net?.mode;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let up: boolean;
        if (this.devices[i].failed || this.devices[j].failed) {
          up = false;
        } else if (mode === "offline") {
          up = false;
        } else if (mode === "online") {
          up = this.in_range[`${i},${j}`];
        } else {
          // intermittent: deterministic flap
          up = this.in_range[`${i},${j}`] && (tick_idx + i + j) % 4 !== 0;
        }
        const key = `${i},${j}`;
        const was = this.pair_up[key] ?? false;
        if (up && !was) {
          out.push(
            emit("agent_detected", this.devices[i].id, this.devices[j].id, {
              pair: [this.devices[i].id, this.devices[j].id],
            }, [])
          );
        } else if (was && !up) {
          // silence loss spam while an endpoint is failed (device_failed covers it)
          if (!(this.devices[i].failed || this.devices[j].failed)) {
            out.push(
              emit("network_lost", this.devices[i].id, this.devices[j].id, {
                pair: [this.devices[i].id, this.devices[j].id],
              }, [])
            );
          }
        }
        this.pair_up[key] = up;
      }
    }
    // agents
    for (let i = 0; i < this.agents.length; i++) {
      const agent = this.agents[i];
      const dev = this.devices[i % this.devices.length];
      if (dev.failed) continue;
      const rt = this.rt[agent.agent_id];
      const state = agent.step();
      const cycle = Math.floor(tick_idx / 10);
      if (state === "PERCEIVE" && !rt.started) {
        rt.started = true;
        const task_id = this.pois.length > 0 ? this.pois[i % this.pois.length].poi_id : `task_${i}`;
        rt.task = task_id;
        out.push(
          emit("task_started", agent.agent_id, null, {
            agent: agent.agent_id,
            device: dev.id,
            task_id,
          }, [])
        );
      } else if (state === "INFER") {
        const mids = ROLE_MODELS[agent.role] ?? [];
        if (mids.length > 0) {
          const m = this.models[mids[0]];
          if (m) {
            const complexity = 0.3 + 0.1 * ((tick_idx + i) % 3);
            dev.battery_percent = dev.battery;
            const res = runInference(dev, m, complexity, this.seed * 100000 + tick_idx * 10 + i);
            dev.battery = Math.max(5.0, dev.battery - res.energy_mwh * 0.5);
            rt.infer = { model: m.model_id, ...res };
          }
        }
      } else if (state === "UPDATE_KNOWLEDGE") {
        if (rt.infer) {
          const task_id = rt.task ?? `task_${i}`;
          let item: KItem;
          if (i === 1 && cycle % 2 === 0 && this.rt[this.agents[0].agent_id].last) {
            item = { ...(this.rt[this.agents[0].agent_id].last as KItem) }; // duplicate path
          } else {
            let status = this.pois.length > 0 ? TRUTH[i % TRUTH.length] : "damaged";
            let kid = `${task_id}@c${cycle}`;
            if (i === 3) {
              // conflict path: stable id, alternating report
              status = cycle % 2 === 0 ? FLIP[status] : status;
              kid = `${task_id}@obs`;
            }
            item = {
              knowledge_id: kid,
              content: { poi: task_id, status },
              confidence: rt.infer.confidence,
              version: cycle,
            };
          }
          const result = this.store.insert(item);
          const deduped = result === "duplicate";
          const ev = emit("knowledge_created", agent.agent_id, null, {
            agent: agent.agent_id,
            device: dev.id,
            knowledge_id: item.knowledge_id,
            content: item.content,
            confidence: item.confidence,
            battery: Math.round(dev.battery * 10) / 10,
            deduped,
          }, []);
          out.push(ev);
          if (!deduped) {
            rt.last = { ...item };
            rt.last_ev = ev.event_id;
            rt.unvalidated.push(item.knowledge_id);
          }
          rt.infer = null;
        }
      } else if (state === "SHARE") {
        if (rt.last) {
          const peer = this.peer(i);
          if (peer !== null) {
            const kid = rt.last.knowledge_id;
            const ev = emit("knowledge_shared", agent.agent_id, this.agents[peer].agent_id, {
              from_device: dev.id,
              to_device: this.devices[peer % this.devices.length].id,
              knowledge_id: kid,
              bytes: JSON.stringify(rt.last).length,
            }, [rt.last_ev]);
            out.push(ev);
            dev.battery = Math.max(5.0, dev.battery - 0.05);
            if ((VALIDATORS as string[]).includes(this.agents[peer].role)) {
              const prt = this.rt[this.agents[peer].agent_id];
              if (!prt.unvalidated.includes(kid)) {
                prt.unvalidated.push(kid);
                prt.shared_ev = ev.event_id;
              }
            }
          }
        }
      } else if (state === "VALIDATE") {
        if ((VALIDATORS as string[]).includes(agent.role)) {
          for (const c of this.store.conflicts()) {
            if (!this.emitted_conflicts.has(c.knowledge_id)) {
              this.emitted_conflicts.add(c.knowledge_id);
              out.push(
                emit("conflict_detected", agent.agent_id, null, {
                  agent: agent.agent_id,
                  knowledge_id: c.knowledge_id,
                }, [])
              );
            }
          }
          if (rt.unvalidated.length > 0) {
            const kid = rt.unvalidated.shift() as string;
            const shared = rt.shared_ev ?? "";
            delete rt.shared_ev;
            out.push(
              emit("knowledge_validated", agent.agent_id, null, {
                agent: agent.agent_id,
                knowledge_id: kid,
              }, [shared])
            );
          }
        }
      } else if (state === "COMPLETE") {
        if (!rt.completed) {
          rt.completed = true;
          out.push(
            emit("task_completed", agent.agent_id, null, {
              agent: agent.agent_id,
              device: dev.id,
              task_id: rt.task ?? `task_${i}`,
            }, [])
          );
        }
      }
    }
    return out;
  }

  private peer(i: number): number | null {
    let best: number | null = null;
    for (let j = 0; j < this.devices.length; j++) {
      if (j === i || this.devices[j].failed) continue;
      const key = `${Math.min(i, j)},${Math.max(i, j)}`;
      if (this.pair_up[key]) {
        if (best === null || j < best) best = j;
      }
    }
    return best;
  }

  /** Test helper mirroring Python _failed. */
  isFailed(dev_id: string): boolean {
    return this.failed(dev_id);
  }
}
