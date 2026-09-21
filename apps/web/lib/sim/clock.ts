const SPEEDS = [0.25, 0.5, 1, 2, 5, 10] as const;
export class Clock {
  sim_time = 0; speed = 1; paused = true;
  constructor(speed = 1) { this.setSpeed(speed); }
  setSpeed(s: number) { if (!(SPEEDS as readonly number[]).includes(s)) throw new Error(`invalid speed ${s}`); this.speed = s; }
  advance(dt: number) { if (!this.paused) this.sim_time += dt * this.speed; }
}
