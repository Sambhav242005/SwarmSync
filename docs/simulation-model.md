# Simulation model: current behavior

> Scope reviewed 31 October 2026: this describes the previously inspected demo or proposed interfaces, not newly verified implementation. The [current synthetic-study scope](RESEARCH-COMPLETION-PLAN.md) governs; schema-2 behavior remains pending acceptance evidence.

Updated: 25 October 2026. Active code is TypeScript in `apps/web/lib/sim`. [DESIGN.md](DESIGN.md) defines the research replacement. Present latency/quality/energy/device values are synthetic, not Android measurements.

## Time and randomness

`Clock.advance(dt)` advances by `dt * speed` when unpaused. Speeds are 0.25, 0.5, 1, 2, 5 and 10. `Engine.step(dt)` temporarily unpauses for one tick and restores pause state. Start changes a flag; it does not install an execution loop.

Each active tick emits `TICK` with Mulberry32 output and advances the world once. Agent progress and intermittent links depend on tick index, so speed/step changes can change outcomes at the same horizon. Playback-speed invariance is pending. Reset clears/reseeds engine and world; tests cover same-seed logs and changed-seed reset, not arbitrary scenario validity.

## Inference and resources

`inference.ts` averages CPU/GPU/NPU scores and applies fixed precision/thermal/battery factors plus seeded jitter to base latency. It synthesizes quality/confidence, returns profile memory and derives energy from a scalar and duration. Duration does not delay state transitions; battery drain uses synthetic constants rather than a calibrated energy model.

These factors are not measured quantization speedups, supported GPU precision, calibrated confidence or physical battery behavior. Real artifacts and task-specific timing/memory profiles are pending.

## Agents, links and replay

Agents cycle through ten states. Role/model choices and demonstration truth/duplicate/conflict paths are hardcoded; only the first assigned role model is used for inference. Completion follows the cycle rather than an independently checked result.

All agents access one knowledge store. Links use range, deterministic tick-index flapping and endpoint failures. Bandwidth, latency and packet loss do not queue/deliver packets. A selectable strategy framework is not implemented.

`rebuild(t)` returns `{sim_time: t, events: log.up_to(t)}`; it does not rewind batteries, agent state, knowledge or queues. Full replay/local stores/scheduled transport are blockers in [TODO.md](TODO.md).
