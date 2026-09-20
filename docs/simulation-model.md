# Simulation model

> All values are **simulated estimates, NOT real Android hardware measurements**.

## Tick

- Discrete ticks via `Engine.tick(dt)`: `Clock.advance(dt)` (`sim_time += dt*speed` if unpaused); paused or zero-advance ticks emit nothing. Live tick emits exactly one `TICK` event; `step(dt)` forces one tick regardless of pause flag (restores flag after).

## Seeded RNG

- `Engine(seed)` -> `random.Random(seed)`; `reset(seed?)` reseeds. Each `TICK` payload carries `rng.random()`. `run_inference(..., seed)` uses `random.Random(seed + int(sha256(model_id),16) % 100000)` (stable sha256 across processes) with `0.95 + rng*0.1` latency jitter and `(rng-0.5)*0.05` quality noise.

## Event log / rebuild

- `EventLog` append-only; `up_to(t)` time-filtered replay. `Engine.rebuild(t)` = scrub primitive: state at `t` is `{sim_time: t, events: up_to(t)}`. Reset clears log, zeroes clock, pauses.

## Inference factors (`run_inference(device, model, complexity, seed)`)

- Capability `cap = (cpu_score + gpu_score + npu_score)/3`.
- Latency: `base_latency_ms * (1.2-cap) * QUANT_FACTOR[quant] * (1+complexity) * THERMAL_FACTOR[thermal_state] * batt(1.2 if battery<20 else 1.0) * jitter`, rounded 2dp. `QUANT_FACTOR = FP32 1.6 / FP16 1.2 / INT8 1.0 / INT4 0.8`; `THERMAL_FACTOR = normal 1.0 / warm 1.3 / hot 1.8`.
- Quality: `clamp(quality_score * cap * (1-complexity*0.2) + noise, 0, 1)` rounded 3dp; `memory_mb = memory_requirement_mb`; `energy_mwh = energy_cost * latency/1000` rounded 3dp; `confidence = quality`.

## Agent / link strategies

- `Agent`: 10-state cycle `IDLE -> PERCEIVE -> INFER -> UPDATE_KNOWLEDGE -> DECIDE_COMM -> SHARE -> WAIT -> COLLABORATE -> VALIDATE -> COMPLETE -> IDLE...`; `step()` advances one state.
- `link_up(a, b, net)`: Euclidean `hypot(dx,dy) <= range_m` (default 30).
- Relay utility: `U = wr*reliability + wi*gain + wu*uncertainty - wb*cost`; weights accept `{r,i,u,b}` or long-form `{reliability,gain,uncertainty,cost}`.
