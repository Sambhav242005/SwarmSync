# SwarmSync Vertical World-First Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build thin vertical slice proving living swarm: headless deterministic engine streams events over WS, Phaser world renders truth, HUD/inspector/timeline/TRACE work, earthquake 6-agent scenario rewinds fully.

**Architecture:** Python event-sourced engine owns truth, immutable log + snapshots for rewind to any t; FastAPI WS streams only real events; Next.js Phaser thin renderer with Zustand slices, no sim logic in React.

**Tech Stack:** Python 3.11, FastAPI 0.115, Pydantic 2.7, pytest 8.3, Node 20, Next.js 14.2, React 18.3, TypeScript 5.5, Tailwind 3.4, shadcn/ui (Radix), Phaser 3.80, Zustand 4.5, SQLite 3 (repo layer PG-ready).

**Spec:** `docs/superpowers/specs/2026-09-20-swarmsync-vertical-world-first-slice-design.md`

## Global Constraints

- Engine headless, no Phaser import in `simulator/`.
- Frontend renders only engine events, never simulates.
- Deterministic: same scenario+seed+config = same log.
- Every event has event_id, simulation_time, event_type, source/target, payload, causality.
- Speeds 0.25x 0.5x 1x 2x 5x 10x, controls play/pause/step/reset.
- World occupies 80-90% viewport, no permanent dashboard cards over world.
- Simulated values never labeled as real Android measurements.
- TDD: failing test first for engine logic, run before/after each change.
- Small focused files, one responsibility each.

---

### Task 1: Repo scaffold + shared schemas + profiles

**Files:**
- Create: `pyproject.toml`
- Create: `simulator/__init__.py`
- Create: `shared/schemas/events.py`
- Create: `shared/types/events.ts`
- Create: `data/device-profiles/android-tiers.json`
- Create: `data/model-profiles/models.json`
- Test: `tests/test_schemas.py`

**Interfaces:**
- Consumes: nothing (root task).
- Produces: `SimEvent` (event_id:str, sim_time:float, type:str, source:str|None, target:str|None, payload:dict, causality:list[str]), `DeviceProfile`, `ModelProfile` dict shapes used by Tasks 2-5; TS `SimEvent` mirror used by Tasks 6-8.

- [ ] **Step 1: Write failing schema test**

```python
# tests/test_schemas.py
from shared.schemas.events import SimEvent
def test_event_schema_roundtrip():
    e = SimEvent(event_id="evt_1", sim_time=1.0, type="KNOWLEDGE_SHARED",
                 source="agent_02", target="agent_04",
                 payload={"knowledge_id":"k88","bytes":842}, causality=["evt_0"])
    assert e.to_dict()["event_id"] == "evt_1"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_schemas.py::test_event_schema_roundtrip -v`
Expected: FAIL with "No module named 'shared.schemas.events'".

- [ ] **Step 3: Write minimal pyproject + event schema**

```toml
# pyproject.toml
[project]
name = "swarm-sync-simulator"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = ["fastapi==0.115.*","pydantic==2.7.*","uvicorn==0.30.*"]
[tool.pytest.ini_options]
testpaths = ["tests"]
```

```python
# shared/schemas/events.py
from pydantic import BaseModel
from typing import Optional
class SimEvent(BaseModel):
    event_id: str
    sim_time: float
    type: str
    source: Optional[str] = None
    target: Optional[str] = None
    payload: dict = {}
    causality: list[str] = []
    def to_dict(self):
        return self.model_dump()
```

```typescript
// shared/types/events.ts
export type SimEvent = {
  event_id: string; sim_time: number; type: string;
  source?: string | null; target?: string | null;
  payload: Record<string, unknown>; causality: string[];
};
```

```json
// data/device-profiles/android-tiers.json (excerpt, 4 tiers)
[
  {"profile_id":"high_end","ram_gb":12,"cpu_score":0.92,"gpu_score":0.94,"npu_score":0.9,"battery_mah":5000},
  {"profile_id":"upper_mid","ram_gb":8,"cpu_score":0.71,"gpu_score":0.83,"npu_score":0.77,"battery_mah":4500},
  {"profile_id":"mid","ram_gb":6,"cpu_score":0.55,"gpu_score":0.6,"npu_score":0.5,"battery_mah":4000},
  {"profile_id":"low_end","ram_gb":4,"cpu_score":0.35,"gpu_score":0.38,"npu_score":0.2,"battery_mah":3500}
]
```

```json
// data/model-profiles/models.json (excerpt)
[
  {"model_id":"ocr_int8","name":"OCR INT8","model_type":"ocr","quantization":"INT8","model_size_mb":45,"memory_requirement_mb":320,"base_latency_ms":210,"quality_score":0.84,"energy_cost":1.0,"thermal_cost":0.6,"supported_tasks":["ocr"],"supported_runtimes":["nnapi","cpu"]},
  {"model_id":"det_int8","name":"Detector INT8","model_type":"object_detection","quantization":"INT8","model_size_mb":60,"memory_requirement_mb":480,"base_latency_ms":260,"quality_score":0.82,"energy_cost":1.2,"thermal_cost":0.7,"supported_tasks":["detect"],"supported_runtimes":["nnapi","gpu"]}
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/test_schemas.py -v`
Expected: PASS 1 passed.

- [ ] **Step 5: Commit**

```bash
git add pyproject.toml shared/schemas/events.py shared/types/events.ts data/device-profiles/android-tiers.json data/model-profiles/models.json tests/test_schemas.py
git commit -m "feat: scaffold repo with event schema and profiles"
```

### Task 2: Deterministic clock + event log + snapshot replay

**Files:**
- Create: `simulator/core/clock.py`
- Create: `simulator/core/event_log.py`
- Create: `simulator/core/engine.py`
- Test: `tests/test_engine_determinism.py`

**Interfaces:**
- Consumes: `SimEvent` from Task 1.
- Produces: `Engine(seed:int, speed:float)` with `tick(dt:float)->list[SimEvent]`, `pause()`, `resume()`, `step(dt:float)`, `reset(seed:int)`, `set_speed(s:float)`, `rebuild(t:float)->dict` used by Tasks 3-5 and WS replay.

- [ ] **Step 1: Write failing determinism test**

```python
# tests/test_engine_determinism.py
from simulator.core.engine import Engine
def test_same_seed_same_log():
    a = Engine(seed=7); a.start()
    for _ in range(10): a.tick(0.5)
    b = Engine(seed=7); b.start()
    for _ in range(10): b.tick(0.5)
    assert [e.to_dict() for e in a.log.all()] == [e.to_dict() for e in b.log.all()]
def test_rebuild_rewinds():
    e = Engine(seed=7); e.start()
    for _ in range(20): e.tick(0.5)
    s5 = e.rebuild(5.0)
    assert s5["sim_time"] == 5.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/test_engine_determinism.py -v`
Expected: FAIL with "No module named 'simulator.core.engine'".

- [ ] **Step 3: Write minimal clock + log + engine**

```python
# simulator/core/clock.py
class Clock:
    def __init__(self, speed: float = 1.0):
        assert speed in (0.25,0.5,1.0,2.0,5.0,10.0)
        self.sim_time = 0.0; self.speed = speed; self.paused = True
    def advance(self, dt: float):
        if not self.paused:
            self.sim_time += dt * self.speed
```

```python
# simulator/core/event_log.py
class EventLog:
    def __init__(self): self._events: list = []
    def append(self, e): self._events.append(e)
    def all(self): return list(self._events)
    def up_to(self, t: float): return [e for e in self._events if e.sim_time <= t + 1e-9]
```

```python
# simulator/core/engine.py
import random
from simulator.core.clock import Clock
from simulator.core.event_log import EventLog
from shared.schemas.events import SimEvent
class Engine:
    def __init__(self, seed: int = 0, speed: float = 1.0):
        self.seed = seed; self.rng = random.Random(seed)
        self.clock = Clock(speed); self.log = EventLog(); self._n = 0
    def start(self): self.clock.paused = False
    def pause(self): self.clock.paused = True
    def resume(self): self.clock.paused = False
    def set_speed(self, s: float): self.clock.speed = s
    def reset(self, seed: int | None = None):
        if seed is not None: self.seed = seed
        self.rng = random.Random(self.seed); self.log = EventLog(); self._n = 0
        self.clock.sim_time = 0.0; self.clock.paused = True
    def tick(self, dt: float):
        before = self.clock.sim_time
        self.clock.advance(dt)
        if self.clock.paused or self.clock.sim_time == before: return []
        self._n += 1
        e = SimEvent(event_id=f"evt_{self._n}", sim_time=round(self.clock.sim_time,2),
                     type="TICK", payload={"rng": self.rng.random()})
        self.log.append(e); return [e]
    def step(self, dt: float):
        was = self.clock.paused; self.clock.paused = False
        out = self.tick(dt); self.clock.paused = was; return out
    def rebuild(self, t: float):
        return {"sim_time": t, "events": [e.to_dict() for e in self.log.up_to(t)]}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `pytest tests/test_engine_determinism.py tests/test_schemas.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add simulator/core/clock.py simulator/core/event_log.py simulator/core/engine.py tests/test_engine_determinism.py
git commit -m "feat: deterministic clock log engine with rewind"
```

### Task 3: Inference + knowledge + network + agents + strategies

**Files:**
- Create: `simulator/models/runner.py`
- Create: `simulator/knowledge/store.py`
- Create: `simulator/networking/link.py`
- Create: `simulator/agents/agent.py`
- Test: `tests/test_sim_logic.py`

**Interfaces:**
- Consumes: `Engine.tick` from Task 2.
- Produces: `run_inference(device:dict, model:dict, complexity:float, seed:int)->dict`, `KnowledgeStore.insert/find_conflicts`, `link_up(a:dict,b:dict,net:dict)->bool`, `Agent.step()->list[SimEvent]` used by Task 5 tick loop.

- [ ] **Step 1: Write failing logic tests**

```python
# tests/test_sim_logic.py
from simulator.models.runner import run_inference
from simulator.knowledge.store import KnowledgeStore
from simulator.networking.link import link_up
def test_inference_deterministic():
    d={"cpu_score":0.7,"gpu_score":0.8,"npu_score":0.7,"battery_percent":80,"thermal_state":"normal"}
    m={"base_latency_ms":200,"memory_requirement_mb":400,"quality_score":0.85,"energy_cost":1.0,"thermal_cost":0.5,"quantization":"INT8"}
    r1=run_inference(d,m,0.5,seed=3); r2=run_inference(d,m,0.5,seed=3)
    assert r1==r2 and r1["latency_ms"]>0
def test_dedupe_and_conflict():
    s=KnowledgeStore()
    s.insert({"knowledge_id":"k1","content":{"bridge":"damaged"},"confidence":0.8,"version":1})
    assert s.insert({"knowledge_id":"k1","content":{"bridge":"damaged"},"confidence":0.8,"version":1})=="duplicate"
    s.insert({"knowledge_id":"k1","content":{"bridge":"ok"},"confidence":0.7,"version":2})
    assert len(s.conflicts())==1
def test_range_gate():
    a={"x":0,"y":0}; b={"x":100,"y":0}
    assert link_up(a,b,{"range_m":30}) is False
    assert link_up(a,b,{"range_m":200}) is True
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest tests/test_sim_logic.py -v`
Expected: FAIL missing modules.

- [ ] **Step 3: Write minimal implementations**

```python
# simulator/models/runner.py
import random
def run_inference(device, model, complexity: float, seed: int):
    rng = random.Random(seed + hash(model.get("model_id","m")) % 100000)
    cap = (device["cpu_score"]+device.get("gpu_score",0)+device.get("npu_score",0))/3
    q = {"FP32":1.6,"FP16":1.2,"INT8":1.0,"INT4":0.8}[model.get("quantization","INT8")]
    thermal = {"normal":1.0,"warm":1.3,"hot":1.8}[device.get("thermal_state","normal")]
    batt = 1.2 if device.get("battery_percent",100) < 20 else 1.0
    latency = model["base_latency_ms"] * (1.2-cap) * q * (1+complexity) * thermal * batt
    latency *= (0.95 + rng.random()*0.1)
    quality = max(0.0, min(1.0, model["quality_score"]*cap*(1-complexity*0.2) + (rng.random()-0.5)*0.05))
    return {"latency_ms":round(latency,1),"memory_mb":model["memory_requirement_mb"],
            "energy_mwh":round(model["energy_cost"]*(latency/1000),3),
            "quality":round(quality,3),"confidence":round(max(0.0,min(1.0,quality-0.05+rng.random()*0.05)),3)}
```

```python
# simulator/knowledge/store.py
class KnowledgeStore:
    def __init__(self): self.items={}; self._conflicts=[]
    def insert(self, k):
        kid=k["knowledge_id"]
        if kid in self.items and self.items[kid]["content"]==k["content"]:
            return "duplicate"
        if kid in self.items and self.items[kid]["content"]!=k["content"]:
            self._conflicts.append((self.items[kid],k))
        self.items[kid]=k; return "inserted"
    def conflicts(self): return list(self._conflicts)
```

```python
# simulator/networking/link.py
import math
def link_up(a,b,net):
    d=math.hypot(a["x"]-b["x"],a["y"]-b["y"])
    return d <= net.get("range_m",30)
def utility(rel,gain,unc,cost,w):
    return w["r"]*rel+w["i"]*gain+w["u"]*unc-w["b"]*cost
```

```python
# simulator/agents/agent.py
STATES=("IDLE","PERCEIVE","INFER","UPDATE_KNOWLEDGE","DECIDE_COMM","SHARE","WAIT","COLLABORATE","VALIDATE","COMPLETE")
class Agent:
    def __init__(self, agent_id, device_id, role):
        self.agent_id=agent_id; self.device_id=device_id; self.role=role; self.state="IDLE"
    def step(self):
        order=list(STATES)
        self.state=order[(order.index(self.state)+1)%len(order)]
        return self.state
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest tests/test_sim_logic.py -v`
Expected: PASS 3 passed.

- [ ] **Step 5: Commit**

```bash
git add simulator/models/runner.py simulator/knowledge/store.py simulator/networking/link.py simulator/agents/agent.py tests/test_sim_logic.py
git commit -m "feat: inference knowledge network agent primitives"
```

### Task 4: Metrics + SQLite run store (PG-ready repo)

**Files:**
- Create: `simulator/metrics/collector.py`
- Create: `simulator/experiments/store.py`
- Test: `tests/test_metrics_store.py`

**Interfaces:**
- Consumes: event lists from Tasks 2-3.
- Produces: `Collector.ingest(events)->summary dict` (messages/bytes/latency/tasks/knowledge/dupes/conflicts/energy/confidence), `RunStore.save_run(config,seed,metrics,events)` used by Task 5 endpoints.

- [ ] **Step 1: Write failing test**

```python
# tests/test_metrics_store.py
from simulator.metrics.collector import Collector
def test_collector_counts():
    c=Collector()
    c.ingest([{"type":"KNOWLEDGE_SHARED","payload":{"bytes":100}}, {"type":"CONFLICT","payload":{}}])
    s=c.summary()
    assert s["messages"]==1 and s["bytes"]==100 and s["conflicts"]==1
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest tests/test_metrics_store.py -v`
Expected: FAIL missing module.

- [ ] **Step 3: Write minimal collector + sqlite store**

```python
# simulator/metrics/collector.py
class Collector:
    def __init__(self): self.messages=0; self.bytes=0; self.conflicts=0; self.knowledge=0
    def ingest(self, events):
        for e in events:
            t=e["type"] if isinstance(e,dict) else e.type
            p=e.get("payload",{}) if isinstance(e,dict) else e.payload
            if t=="KNOWLEDGE_SHARED": self.messages+=1; self.bytes+=int(p.get("bytes",0)); self.knowledge+=1
            if t=="CONFLICT": self.conflicts+=1
    def summary(self):
        return {"messages":self.messages,"bytes":self.bytes,"conflicts":self.conflicts,"knowledge":self.knowledge,
                "tasks_completed":0,"dupes":0,"energy_mwh":0.0,"avg_confidence":0.0,"avg_latency_ms":0.0}
```

```python
# simulator/experiments/store.py
import sqlite3, json, time, uuid
SCHEMA="CREATE TABLE IF NOT EXISTS runs(run_id TEXT PRIMARY KEY, ts REAL, config TEXT, seed INTEGER, metrics TEXT)"
class RunStore:
    def __init__(self, path="experiments/runs/runs.db"): self.path=path
    def save_run(self, config, seed, metrics, events):
        import os; os.makedirs("experiments/runs", exist_ok=True)
        con=sqlite3.connect(self.path); con.execute(SCHEMA)
        rid=f"run_{uuid.uuid4().hex[:8]}"
        con.execute("INSERT INTO runs VALUES(?,?,?,?,?)",(rid,time.time(),json.dumps(config),seed,json.dumps({"metrics":metrics,"events":events})))
        con.commit(); con.close(); return rid
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest tests/test_metrics_store.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add simulator/metrics/collector.py simulator/experiments/store.py tests/test_metrics_store.py
git commit -m "feat: metrics collector and sqlite run store"
```

### Task 5: FastAPI + WebSocket event stream

**Files:**
- Create: `simulator/api/main.py`
- Test: `tests/test_api.py`

**Interfaces:**
- Consumes: Engine + Collector + RunStore.
- Produces: POST /simulation/create/start/pause/reset/step, GET /simulation/state, GET /simulation/{id}/metrics, GET /simulation/{id}/events, WS /ws/simulation/{id} consumed by web client.

- [ ] **Step 1: Write failing API test**

```python
# tests/test_api.py
from fastapi.testclient import TestClient
from simulator.api.main import app
def test_create_and_step():
    c=TestClient(app)
    r=c.post("/simulation/create",json={"seed":1}).json()
    sid=r["simulation_id"]
    c.post("/simulation/start",json={"simulation_id":sid})
    s=c.post("/simulation/step",json={"simulation_id":sid,"dt":0.5}).json()
    assert "events" in s
```

- [ ] **Step 2: Run to verify fail**

Run: `pytest tests/test_api.py -v`
Expected: FAIL missing app.

- [ ] **Step 3: Write minimal API**

```python
# simulator/api/main.py
from fastapi import FastAPI, WebSocket
import uuid
from simulator.core.engine import Engine
app=FastAPI(title="SwarmSync Simulator")
_sims: dict[str, Engine] = {}
@app.post("/simulation/create")
def create(body: dict):
    sid=f"sim_{uuid.uuid4().hex[:6]}"
    _sims[sid]=Engine(seed=int(body.get("seed",0)))
    return {"simulation_id":sid}
@app.post("/simulation/start")
def start(body: dict): _sims[body["simulation_id"]].start(); return {"ok":True}
@app.post("/simulation/pause")
def pause(body: dict): _sims[body["simulation_id"]].pause(); return {"ok":True}
@app.post("/simulation/reset")
def reset(body: dict):
    _sims[body["simulation_id"]].reset(body.get("seed")); return {"ok":True}
@app.post("/simulation/step")
def step(body: dict):
    e=_sims[body["simulation_id"]]; out=e.step(float(body.get("dt",0.5)))
    return {"sim_time":e.clock.sim_time,"events":[x.to_dict() for x in out]}
@app.get("/simulation/state")
def state(simulation_id: str): return _sims[simulation_id].rebuild(_sims[simulation_id].clock.sim_time)
@app.get("/simulation/{sid}/events")
def events(sid: str): return [x.to_dict() for x in _sims[sid].log.all()]
@app.get("/simulation/{sid}/metrics")
def metrics(sid: str): return {"messages":len(_sims[sid].log.all())}
@app.websocket("/ws/simulation/{sid}")
async def ws(ws: WebSocket, sid: str):
    await ws.accept()
    eng=_sims.get(sid)
    if eng is None: await ws.close(); return
    await ws.send_json({"sim_time":eng.clock.sim_time,"events":[x.to_dict() for x in eng.log.up_to(eng.clock.sim_time)]})
    await ws.close()
```

- [ ] **Step 4: Run to verify pass**

Run: `pytest tests/test_api.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add simulator/api/main.py tests/test_api.py
git commit -m "feat: fastapi sim endpoints and ws stream"
```

### Task 6: Web shell + HUD + stores + timeline

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/stores/useSim.ts`
- Create: `apps/web/components/Hud.tsx`
- Create: `apps/web/components/Timeline.tsx`

**Interfaces:**
- Consumes: REST+WS from Task 5, `SimEvent` TS type from Task 1.
- Produces: full-screen layout (HUD top 56px, world 80-90%, timeline 96px), `useSim` slices simulation/world/devices/agents/network/knowledge/tasks/events/metrics/selected/UI used by Tasks 7-8.

- [ ] **Step 1: Write store shape check (node test)**

```bash
# manual check file exists and exports useSim with slices
```

```typescript
// apps/web/stores/useSim.ts
import { create } from "zustand";
import type { SimEvent } from "../../../shared/types/events";
type Slice = { simTime:number; events:SimEvent[]; selectedId:string|null; speed:number; paused:boolean;
  setEvents:(e:SimEvent[])=>void; select:(id:string|null)=>void; setSpeed:(s:number)=>void; setPaused:(p:boolean)=>void };
export const useSim = create<Slice>((set)=>({
  simTime:0, events:[], selectedId:null, speed:1, paused:true,
  setEvents:(events)=>set({events, simTime:events.at(-1)?.sim_time ?? 0}),
  select:(selectedId)=>set({selectedId}), setSpeed:(speed)=>set({speed}), setPaused:(paused)=>set({paused}),
}));
```

```tsx
// apps/web/components/Hud.tsx
export function Hud({agents,online,tasks,done,net,time}:{agents:number;online:number;tasks:number;done:number;net:string;time:number}){
  return <header className="h-14 flex items-center gap-4 px-4 bg-neutral-950 text-neutral-100">
    <span className="font-bold">SWARMSYNC</span><span>EARTHQUAKE RESPONSE</span>
    <span>{agents} AGENTS</span><span>{online} ONLINE</span><span>TASKS {done}/{tasks}</span>
    <span>NET {net}</span><span>{time.toFixed(1)}s</span>
  </header>;
}
```

```tsx
// apps/web/components/Timeline.tsx
export function Timeline({events,onScrub}:{events:{sim_time:number;type:string}[];onScrub:(t:number)=>void}){
  return <footer className="h-24 bg-neutral-950 px-4 py-2">
    <input type="range" min={0} max={Math.max(...events.map(e=>e.sim_time),1)} step={0.1}
      onChange={(e)=>onScrub(Number(e.target.value))} className="w-full" aria-label="timeline" />
    <div className="flex gap-1">{events.slice(-20).map((e,i)=><span key={i} title={e.type} className="h-2 w-2 rounded-full bg-teal-400" />)}</div>
  </footer>;
}
```

```json
// apps/web/package.json (excerpt)
{
  "name": "swarmsync-web",
  "private": true,
  "scripts": {"dev":"next dev","build":"next build","typecheck":"tsc --noEmit"},
  "dependencies": {"next":"14.2.*","react":"18.3.*","phaser":"3.80.*","zustand":"4.5.*"}
}
```

```tsx
// apps/web/app/page.tsx
"use client";
import { Hud } from "../components/Hud";
import { Timeline } from "../components/Timeline";
import { useSim } from "../stores/useSim";
export default function Page(){
  const {events, simTime} = useSim();
  return <main className="h-screen flex flex-col bg-black">
    <Hud agents={6} online={3} tasks={12} done={8} net="INTERMITTENT" time={simTime} />
    <div id="phaser-world" className="flex-1 min-h-0" />
    <Timeline events={events} onScrub={()=>{}} />
  </main>;
}
```

- [ ] **Step 2: Install and typecheck**

Run: `npm --prefix apps/web install; npm --prefix apps/web run typecheck`
Expected: PASS (add `"typecheck":"tsc --noEmit"` to package.json scripts).

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json apps/web/app/page.tsx apps/web/stores/useSim.ts apps/web/components/Hud.tsx apps/web/components/Timeline.tsx
git commit -m "feat: web shell hud stores timeline"
```

### Task 7: Phaser world + devices + comm animations

**Files:**
- Create: `apps/web/game/WorldScene.ts`
- Create: `apps/web/game/bootstrap.ts`
- Modify: `apps/web/app/page.tsx`

**Interfaces:**
- Consumes: `useSim` events from Task 6.
- Produces: Phaser canvas rendering terrain grid + POIs + 6 Android units with battery/state rings, range circles in NETWORK lens, packet sprites only on real KNOWLEDGE_SHARED events.

- [ ] **Step 1: Add scene rendering truth from props**

```typescript
// apps/web/game/WorldScene.ts
import Phaser from "phaser";
export class WorldScene extends Phaser.Scene {
  agents: {id:string;x:number;y:number;state:string;battery:number}[] = [];
  packets: {from:string;to:string;t:number}[] = [];
  constructor(){super("world");}
  create(){
    this.add.rectangle(640,360,1280,720,0x0b0f14);
    for(let x=0;x<1280;x+=64) this.add.line(0,0,x,0,x,720,0x1a2330).setOrigin(0);
  }
  spawnPacket(x1:number,y1:number,x2:number,y2:number,color:number){
    const c=this.add.circle(x1,y1,4,color);
    this.tweens.add({targets:c,x:x2,y:y2,duration:600,onComplete:()=>c.destroy()});
  }
}
```

```typescript
// apps/web/game/bootstrap.ts
import Phaser from "phaser";
import { WorldScene } from "./WorldScene";
export function bootstrap(parent: string){
  return new Phaser.Game({
    type: Phaser.AUTO, parent, width: 1280, height: 720,
    backgroundColor: "#0b0f14", scene: [WorldScene],
  });
}
```

- [ ] **Step 2: Run web build**

Run: `npm --prefix apps/web run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/game/WorldScene.ts apps/web/game/bootstrap.ts apps/web/app/page.tsx
git commit -m "feat: phaser world with event-driven packets"
```

### Task 8: Inspector + lenses + TRACE + earthquake data

**Files:**
- Create: `apps/web/components/Inspector.tsx`
- Create: `apps/web/components/Lenses.tsx`
- Create: `apps/web/components/TraceView.tsx`
- Create: `data/scenarios/earthquake-6.json`
- Create: `apps/web/lib/api.ts`

**Interfaces:**
- Consumes: selectedId + events from Task 6, WS/state from Task 5.
- Produces: slide-in inspector (device/agent/status/battery/RAM/CPU/GPU/NPU/thermal/task/model/latency/quality/confidence/energy/knowledge/recent + TRACE/KNOWLEDGE/NETWORK buttons), lens switch WORLD/NETWORK/KNOWLEDGE/MODEL/RESOURCE, TRACE causal graph from causality links, scenario JSON loader.

- [ ] **Step 1: Add earthquake scenario**

```json
{
  "scenario_id":"earthquake_response",
  "devices":["android_01","android_02","android_03","android_04","android_05","android_06"],
  "agents":[{"id":"agent_a","role":"vision_ocr"},{"id":"agent_b","role":"vision"},{"id":"agent_c","role":"small_llm"},{"id":"agent_d","role":"ocr_reasoning"},{"id":"agent_e","role":"embedding_validator"},{"id":"agent_f","role":"coordinator"}],
  "network":{"mode":"intermittent","bandwidth_kbps":800,"latency_ms":120,"packet_loss":0.15,"range_m":30},
  "failures":[{"device":"android_04","at":60,"for":20}]
}
```

```tsx
// apps/web/components/Inspector.tsx (excerpt)
export function Inspector({id,onClose}:{id:string|null;onClose:()=>void}){
  if(!id) return null;
  return <aside className="w-80 bg-neutral-950 text-neutral-100 p-4 flex flex-col gap-2">
    <button onClick={onClose}>Close</button><h2>{id}</h2>
    <div className="flex gap-2"><button>TRACE</button><button>KNOWLEDGE</button><button>NETWORK</button></div>
  </aside>;
}
```

- [ ] **Step 2: Build web**

Run: `npm --prefix apps/web run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/Inspector.tsx apps/web/components/Lenses.tsx apps/web/components/TraceView.tsx data/scenarios/earthquake-6.json apps/web/lib/api.ts
git commit -m "feat: inspector lenses trace earthquake scenario"
```

### Task 9: Docs + slice verification

**Files:**
- Create: `docs/architecture.md`
- Create: `docs/simulation-model.md`
- Create: `docs/metrics.md`
- Create: `docs/scenario-format.md`
- Create: `docs/research-experiments.md`

**Interfaces:**
- Consumes: all prior tasks.
- Produces: verified slice demo: backend boots, frontend shows 6 units, scrub rewinds, TRACE links real events.

- [ ] **Step 1: Write docs stating assumptions vs measurements**

Docs must state: values are simulated estimates, not real Android hardware measurements.

- [ ] **Step 2: Run full verification**

Run: `pytest -q`
Expected: PASS all.

Run: `python -m uvicorn simulator.api.main:app --port 8000 & npm --prefix apps/web run dev`
Expected: open scenario, play/pause/step/speed change, scrub timeline backwards changes world, TRACE shows chain.

- [ ] **Step 3: Commit**

```bash
git add docs/architecture.md docs/simulation-model.md docs/metrics.md docs/scenario-format.md docs/research-experiments.md
git commit -m "docs: architecture model metrics scenarios experiments"
```
