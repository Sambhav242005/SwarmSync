class Clock:
    def __init__(self, speed: float = 1.0):
        assert speed in (0.25,0.5,1.0,2.0,5.0,10.0)
        self.sim_time = 0.0; self.speed = speed; self.paused = True
    def advance(self, dt: float):
        if not self.paused:
            self.sim_time += dt * self.speed
