# NextJS-Only Port Design

## Goal
Single Next.js deploy. No Python. No separate uvicorn. Same sim behavior, new RNG goldens.

## Architecture
`apps/web` becomes whole repo. Sim lives in `apps/web/lib/sim/*.ts` (pure TS, no React). App Router routes under `apps/web/app/api/simulation/*` own in-memory `Map<sid, Engine>`. JSON data moves to `apps/web/data/`. Frontend `lib/api.ts` uses relative fetch. Polling replaces one-shot WS.

## Components
- `lib/sim/types.ts`: SimEvent, Device, AgentState, Topology types.
- `lib/sim/rng.ts`: mulberry32 + hashSeed. Deterministic, NOT bit-identical to Python Mersenne Twister. New goldens accepted.
- `lib/sim/clock.ts`, `eventLog.ts`, `agent.ts`, `link.ts`, `knowledgeStore.ts`, `inference.ts`, `swarm.ts`, `engine.ts`, `collector.ts`, `store.ts`.
- Routes: `create`, `start`, `pause`, `reset`, `step`, `speed` (POST), `state` (GET ?simulation_id&at), `[sid]/events`, `[sid]/topology`, `[sid]/metrics`.
- `lib/api.ts`: BASE="" relative. Same exports. `connectSimulationWs` removed, replaced by `pollState`.
- Tests: vitest `lib/sim/*.test.ts` + `app/api` route tests.

## Data flow
create -> Engine(seed) + load scenario/models/tiers from `apps/web/data` -> store Map. step/tick -> Engine.tick(dt) -> events appended. state?at -> rebuild up_to(t). metrics -> Collector.ingest(log).

## Error handling
Same codes as FastAPI: 404 unknown sid, 400 bad seed/dt/scenario_id/speed/at. Zod-lite manual validation, no new dep.

## Testing
Port `test_swarm_tick.py` (topology, markers, determinism, failure/conflict/completion, battery) and `test_api.py` (create/step, 404, 400, topology, state at/speed/metrics) to vitest. 18 pytest -> ~12 vitest.

## Deletion
Delete `simulator/`, `shared/`, `tests/*.py`, `pyproject.toml`, `.pytest_cache/`. Move `data/` -> `apps/web/data/`. Keep `docs/`, `apps/web/`.
