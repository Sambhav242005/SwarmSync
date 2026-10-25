# Architecture: current implementation

Updated: 25 October 2026. Existing behavior is described here; [DESIGN.md](../DESIGN.md) is the target architecture, [SPEC.md](../SPEC.md) owns requirements, and [TODO.md](../TODO.md) tracks work.

The active application lives in `apps/web`: Next.js App Router, React, TypeScript, Phaser and Zustand. The Python backend was removed. Remaining top-level directory names do not establish an active Python service.

`lib/sim/engine.ts` owns a Mulberry32 RNG, clock, event log and `SwarmWorld`. Data come from `apps/web/data`. It emits tick and world events for tasks, knowledge, discovery/loss and device failure/recovery; it is not tick-only.

Handlers under `/api/simulation/` expose create/start/pause/reset/step/speed/state and per-simulation topology/events/metrics. A module-local in-memory Map holds engines. There is no active SQLite run repository or WebSocket service. Cross-route/multi-worker ownership, server-driven advancement and persistence remain to be validated/implemented.

The API client has relative fetch helpers, but the page does not connect a live simulation workflow. HUD values are hardcoded, timeline scrub is a no-op and the Phaser scene is an unwired grid. Utility classes lack a matching stylesheet/Tailwind setup. An untracked Controls component exists but is not mounted.

The world uses one knowledge store, fixed state-cycle agents and unscheduled inference estimates. Network delay/loss/bandwidth do not govern delivery. `rebuild(t)` filters events instead of reconstructing state. See [simulation model](simulation-model.md) and [metrics](metrics.md).

The earlier audit passed three Vitest files (13 tests), TypeScript and a production build. Browser behavior and scientific validity are separate pending checks. No real dataset/checkpoint or Android inference adapter is integrated.
