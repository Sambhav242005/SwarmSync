import random
from simulator.core.clock import Clock
from simulator.core.event_log import EventLog
from shared.schemas.events import SimEvent
class Engine:
    def __init__(self, seed: int = 0, speed: float = 1.0):
        self.seed = seed; self.rng = random.Random(seed)
        self.clock = Clock(speed); self.log = EventLog(); self._n = 0
        self.world = None; self._load_args = None; self._wtick = 0

    def load_scenario(self, scenario: dict, models: list, tiers: list):
        from simulator.scenarios.swarm import SwarmWorld
        self._load_args = (scenario, models, tiers)
        self.world = SwarmWorld(self.seed, scenario, models, tiers)

    def topology(self):
        if self.world is None:
            return {"devices": [], "agents": [], "pois": []}
        return self.world.topology()

    def _emit(self, type: str, source, target, payload: dict, causality=None):
        self._n += 1
        e = SimEvent(event_id=f"evt_{self._n}", sim_time=round(self.clock.sim_time, 2),
                     type=type, source=source, target=target,
                     payload=payload, causality=[c for c in (causality or []) if c])
        self.log.append(e)
        return e
    def start(self): self.clock.paused = False
    def pause(self): self.clock.paused = True
    def resume(self): self.clock.paused = False
    def set_speed(self, s: float): 
        if s not in (0.25,0.5,1.0,2.0,5.0,10.0): raise ValueError(f"invalid speed {s}")
        self.clock.speed = s
    def reset(self, seed: int | None = None):
        if seed is not None: self.seed = seed
        self.rng = random.Random(self.seed); self.log = EventLog(); self._n = 0
        self.clock.sim_time = 0.0; self.clock.paused = True; self._wtick = 0
        if self._load_args is not None:
            scn, models, tiers = self._load_args
            self.load_scenario(scn, models, tiers)
    def tick(self, dt: float):
        before = self.clock.sim_time
        self.clock.advance(dt)
        if self.clock.paused or self.clock.sim_time == before: return []
        self._n += 1
        e = SimEvent(event_id=f"evt_{self._n}", sim_time=round(self.clock.sim_time,2),
                     type="TICK", payload={"rng": self.rng.random()})
        self.log.append(e)
        out = [e]
        if self.world is not None:
            out.extend(self.world.tick(self.clock.sim_time, before, self._wtick, self._emit))
            self._wtick += 1
        return out
    def step(self, dt: float):
        was = self.clock.paused; self.clock.paused = False
        out = self.tick(dt); self.clock.paused = was; return out
    def rebuild(self, t: float):
        return {"sim_time": t, "events": [e.to_dict() for e in self.log.up_to(t)]}
