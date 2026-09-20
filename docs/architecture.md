# Architecture

> All latencies, quality scores, energy figures in this slice are **simulated estimates, NOT real Android hardware measurements**.

## Event-sourced engine

- `simulator/core/clock.py`: `Clock(speed)` in (0.25, 0.5, 1.0, 2.0, 5.0, 10.0); `sim_time` advances `dt*speed` when unpaused; starts paused.
- `simulator/core/event_log.py`: `EventLog.append/all/up_to(t)`; `up_to` filters `sim_time <= t + 1e-9`.
- `simulator/core/engine.py`: `Engine(seed, speed)` owns `random.Random(seed)` + Clock + EventLog. `start/pause/resume/set_speed/reset(seed?)`; `tick(dt)` emits one `TICK` SimEvent (`evt_{n}`, `sim_time` rounded 2dp, payload `rng`); `step(dt)` unpauses for one tick then restores pause state; `rebuild(t)` returns `{sim_time, events: up_to(t) as dicts}` — scrub/rewind primitive.
- `shared/schemas/events.py`: `SimEvent(event_id, sim_time, type, source?, target?, payload={}, causality=[])` + `to_dict()`.

## API / WS

- `simulator/api/main.py` (FastAPI `SwarmSync Simulator`): in-memory `_sims: dict[str, Engine]`.
- `POST /simulation/create {seed}` -> `{simulation_id}`; `start/pause/reset/step {simulation_id, dt?}`; `GET /simulation/state?simulation_id` -> `rebuild(now)`; `GET /simulation/{sid}/events`; `GET /simulation/{sid}/metrics` -> `{messages: len(log)}` (minimal stub; full Collector wiring deferred, see metrics doc).
- `WS /ws/simulation/{sid}`: accepts, sends `{sim_time, events: up_to(now)}` snapshot, closes (one-shot snapshot stream in slice).

## Thin renderer

- `apps/web`: Next.js shell (Hud, Timeline, world div ids preserved Task6->7), Phaser world renders 6 units event-driven from WS/REST packets, Inspector/Lenses/Trace render events only — **no sim logic in frontend**. `useSim(selectedId, events, speed, paused)` hook shared by Inspector/Lenses/Trace.

## Repo structure

- `simulator/{core,agents,models,knowledge,networking,metrics,experiments,api}` headless (no phaser/react imports); `shared/schemas`; `data/{scenarios,device-profiles,model-profiles}`; `apps/web`; `tests/` (pytest, PYTHONPATH=root); `docs/`.
