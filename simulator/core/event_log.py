class EventLog:
    def __init__(self): self._events: list = []
    def append(self, e): self._events.append(e)
    def all(self): return list(self._events)
    def up_to(self, t: float): return [e for e in self._events if e.sim_time <= t + 1e-9]
