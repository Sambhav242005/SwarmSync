"""Deterministic scenario-driven swarm: devices, agents, links, failures.

Headless. All choices derive from the world seed + tick index so the
same scenario + seed always yields the same event stream. Devices are
static (positions fixed at load); links flap deterministically in
intermittent mode; one scripted device failure comes from the scenario.
"""
import math
import random

from simulator.agents.agent import Agent
from simulator.knowledge.store import KnowledgeStore
from simulator.models.runner import run_inference
from simulator.networking.link import link_up

ROLE_MODELS = {
    "vision_ocr": ["det_int8", "ocr_int8"],
    "vision": ["det_int8"],
    "small_llm": ["llm_int4"],
    "ocr_reasoning": ["ocr_int8", "reason_int8"],
    "embedding_validator": ["embed_int8"],
    "coordinator": [],
}
VALIDATORS = ("embedding_validator", "coordinator")
# ground-truth POI status by poi index; agent index 3 reports flipped (conflict path)
TRUTH = ["damaged", "severe", "intact", "damaged", "severe", "intact"]
FLIP = {"damaged": "intact", "intact": "damaged", "severe": "intact"}
TIER_ORDER = ["high_end", "upper_mid", "mid", "low_end", "mid", "upper_mid"]
START_BATTERY = [95.0, 80.0, 70.0, 60.0, 50.0, 85.0]


class SwarmWorld:
    def __init__(self, seed, scenario, models, tiers):
        self.seed = seed
        self.models = {m["model_id"]: m for m in models}
        self.tiers = {t["profile_id"]: t for t in tiers}
        self.net = scenario.get("network", {})
        self.failures = scenario.get("failures", [])
        self.pois = scenario.get("pois", [])
        self.devices = []
        self.agents = []
        self.store = KnowledgeStore()
        self.pair_up = {}
        self.emitted_conflicts = set()
        self._load(scenario)

    def _load(self, scenario):
        rng = random.Random(self.seed + 999)
        cx, cy, r = 640.0, 360.0, 22.0
        for i, dev_id in enumerate(scenario.get("devices", [])):
            tier = self.tiers[TIER_ORDER[i % len(TIER_ORDER)]]
            ang = i * (2 * math.pi / max(len(scenario.get("devices", [])), 1))
            self.devices.append({
                "id": dev_id,
                "x": round(cx + r * math.cos(ang) + rng.uniform(-4, 4), 1),
                "y": round(cy + r * math.sin(ang) + rng.uniform(-4, 4), 1),
                "tier": tier["profile_id"],
                "cpu_score": tier["cpu_score"],
                "gpu_score": tier["gpu_score"],
                "npu_score": tier["npu_score"],
                "ram_gb": tier["ram_gb"],
                "battery": START_BATTERY[i % len(START_BATTERY)],
                "thermal_state": "normal",
                "failed": False,
            })
        for i, a in enumerate(scenario.get("agents", [])):
            agent = Agent(a["id"], self.devices[i % len(self.devices)]["id"], a.get("role", "worker"))
            self.agents.append(agent)
        self.rt = {
            a.agent_id: {"started": False, "completed": False, "infer": None,
                         "last": None, "unvalidated": []}
            for a in self.agents
        }
        n = len(self.devices)
        self.in_range = {}
        for i in range(n):
            for j in range(i + 1, n):
                self.in_range[(i, j)] = link_up(self.devices[i], self.devices[j], self.net)

    def reset(self):
        self.store = KnowledgeStore()
        self.pair_up = {}
        self.emitted_conflicts = set()
        dev_ids = [d["id"] for d in self.devices]
        roles = [a.role for a in self.agents]
        aids = [a.agent_id for a in self.agents]
        scenario = {"devices": dev_ids,
                    "agents": [{"id": k, "role": v} for k, v in zip(aids, roles)],
                    "network": self.net, "failures": self.failures, "pois": self.pois}
        self.devices, self.agents = [], []
        self._load(scenario)
        self.rt = {a.agent_id: {"started": False, "completed": False, "infer": None,
                                "last": None, "unvalidated": []} for a in self.agents}

    def topology(self):
        return {
            "devices": [{"id": d["id"], "x": d["x"], "y": d["y"], "tier": d["tier"],
                         "battery": round(d["battery"], 1), "failed": d["failed"],
                         "ram_gb": d["ram_gb"]} for d in self.devices],
            "agents": [{"id": a.agent_id, "device": a.device_id, "role": a.role,
                        "state": a.state} for a in self.agents],
            "pois": self.pois,
        }

    def _failed(self, dev_id):
        return next(d for d in self.devices if d["id"] == dev_id)["failed"]

    def tick(self, now, prev, tick_idx, emit):
        out = []
        for f in self.failures:
            dev = next(d for d in self.devices if d["id"] == f["device"])
            if prev < f["at"] <= now and not dev["failed"]:
                dev["failed"] = True
                out.append(emit("device_failed", dev["id"], None,
                                {"device": dev["id"], "at": f["at"]}, []))
            if prev < f["at"] + f["for"] <= now and dev["failed"]:
                dev["failed"] = False
                out.append(emit("device_recovered", dev["id"], None,
                                {"device": dev["id"]}, []))
        # link flap + discovery / loss
        n = len(self.devices)
        for i in range(n):
            for j in range(i + 1, n):
                if self.devices[i]["failed"] or self.devices[j]["failed"]:
                    up = False
                elif self.net.get("mode") == "offline":
                    up = False
                elif self.net.get("mode") == "online":
                    up = self.in_range[(i, j)]
                else:  # intermittent: deterministic flap
                    up = self.in_range[(i, j)] and ((tick_idx + i + j) % 4 != 0)
                was = self.pair_up.get((i, j), False)
                if up and not was:
                    out.append(emit("agent_detected",
                                    self.devices[i]["id"], self.devices[j]["id"],
                                    {"pair": [self.devices[i]["id"], self.devices[j]["id"]]}, []))
                elif was and not up:
                    # silence loss spam while an endpoint is failed (device_failed covers it)
                    if not (self.devices[i]["failed"] or self.devices[j]["failed"]):
                        out.append(emit("network_lost",
                                        self.devices[i]["id"], self.devices[j]["id"],
                                        {"pair": [self.devices[i]["id"], self.devices[j]["id"]]}, []))
                self.pair_up[(i, j)] = up
        # agents
        for i, agent in enumerate(self.agents):
            dev = self.devices[i % len(self.devices)]
            if dev["failed"]:
                continue
            rt = self.rt[agent.agent_id]
            state = agent.step()
            cycle = tick_idx // 10
            if state == "PERCEIVE" and not rt["started"]:
                rt["started"] = True
                task_id = self.pois[i % len(self.pois)]["poi_id"] if self.pois else f"task_{i}"
                rt["task"] = task_id
                out.append(emit("task_started", agent.agent_id, None,
                                {"agent": agent.agent_id, "device": dev["id"],
                                 "task_id": task_id}, []))
            elif state == "INFER":
                mids = ROLE_MODELS.get(agent.role, [])
                if mids:
                    m = self.models[mids[0]]
                    complexity = 0.3 + 0.1 * ((tick_idx + i) % 3)
                    dev["battery_percent"] = dev["battery"]
                    res = run_inference(dev, m, complexity,
                                        seed=self.seed * 100000 + tick_idx * 10 + i)
                    dev["battery"] = max(5.0, dev["battery"] - res["energy_mwh"] * 0.5)
                    rt["infer"] = {"model": m["model_id"], **res}
            elif state == "UPDATE_KNOWLEDGE":
                if rt.get("infer"):
                    task_id = rt.get("task", f"task_{i}")
                    item = None
                    if i == 1 and cycle % 2 == 0 and self.rt[self.agents[0].agent_id]["last"]:
                        item = dict(self.rt[self.agents[0].agent_id]["last"])  # duplicate path
                    else:
                        status = TRUTH[i % len(TRUTH)] if self.pois else "damaged"
                        kid = f"{task_id}@c{cycle}"
                        if i == 3:  # conflict path: stable id, alternating report
                            status = FLIP[status] if cycle % 2 == 0 else status
                            kid = f"{task_id}@obs"
                        item = {"knowledge_id": kid,
                                "content": {"poi": task_id, "status": status},
                                "confidence": rt["infer"]["confidence"],
                                "version": cycle}
                    result = self.store.insert(item)
                    deduped = result == "duplicate"
                    ev = emit("knowledge_created", agent.agent_id, None,
                              {"agent": agent.agent_id, "device": dev["id"],
                               "knowledge_id": item["knowledge_id"],
                               "content": item["content"],
                               "confidence": item["confidence"],
                               "battery": round(dev["battery"], 1),
                               "deduped": deduped}, [])
                    out.append(ev)
                    if not deduped:
                        rt["last"] = dict(item)
                        rt["last_ev"] = ev.event_id
                        rt["unvalidated"].append(item["knowledge_id"])
                    rt["infer"] = None
            elif state == "SHARE":
                if rt.get("last"):
                    peer = self._peer(i)
                    if peer is not None:
                        kid = rt["last"]["knowledge_id"]
                        ev = emit("knowledge_shared", agent.agent_id,
                                  self.agents[peer].agent_id,
                                  {"from_device": dev["id"],
                                   "to_device": self.devices[peer % len(self.devices)]["id"],
                                   "knowledge_id": kid,
                                   "bytes": len(repr(rt["last"]))}, [rt.get("last_ev", "")])
                        out.append(ev)
                        dev["battery"] = max(5.0, dev["battery"] - 0.05)
                        if self.agents[peer].role in VALIDATORS:
                            prt = self.rt[self.agents[peer].agent_id]
                            if kid not in prt["unvalidated"]:
                                prt["unvalidated"].append(kid)
                                prt["shared_ev"] = ev.event_id
            elif state == "VALIDATE":
                if agent.role in VALIDATORS:
                    for c in self.store.conflicts():
                        if c["knowledge_id"] not in self.emitted_conflicts:
                            self.emitted_conflicts.add(c["knowledge_id"])
                            out.append(emit("conflict_detected", agent.agent_id, None,
                                            {"agent": agent.agent_id,
                                             "knowledge_id": c["knowledge_id"]}, []))
                    if rt["unvalidated"]:
                        kid = rt["unvalidated"].pop(0)
                        out.append(emit("knowledge_validated", agent.agent_id, None,
                                        {"agent": agent.agent_id,
                                         "knowledge_id": kid}, [rt.pop("shared_ev", "")]))
            elif state == "COMPLETE":
                if not rt["completed"]:
                    rt["completed"] = True
                    out.append(emit("task_completed", agent.agent_id, None,
                                    {"agent": agent.agent_id, "device": dev["id"],
                                     "task_id": rt.get("task", f"task_{i}")}, []))
        return out

    def _peer(self, i):
        best = None
        for j in range(len(self.devices)):
            if j == i or self.devices[j]["failed"]:
                continue
            key = (min(i, j), max(i, j))
            if self.pair_up.get(key):
                if best is None or j < best:
                    best = j
        return best
