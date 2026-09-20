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
