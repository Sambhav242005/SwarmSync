# Session registry fix and regression verification

Date: 31 October 2026. Worker: Luna/high requested; observed execution settings and token/cache usage unavailable. Lead inspected source/diff and independently ran the passing checks below. No independent advisor consultation; bounded three-file fix.

## Failure and fix

Before the fix, Luna reproduced actual dev HTTP create returning 200 followed immediately by state returning 404 for the returned ID. Separately compiled routes had a module-local registry. A module-reload regression in `apps/web/app/api/simulation/api.test.ts` also failed before the fix: create in one module graph, reset the module cache, then step through a newly imported route returned 404 instead of 200.

`apps/web/lib/sim/store.ts` now stores the registry on `globalThis` so separately evaluated route modules in one process share it. This is not durable storage or multi-process ownership. Source: existing module-local Map; fix scope is registry ownership only. No research engine, scientific policy or viewer behavior was changed.

Added `apps/web/scripts/simulation-http-smoke.mjs` as a dependency-free actual-server smoke check. It verifies successful route responses and unknown-ID rejection. The separate lead HTTP assertions below verify state behavior, rather than treating a 200 response alone as sufficient.

## Actual checks

Worker reported red-before/green-after regression and two successful actual-server smoke runs. Lead independently executed from `apps/web`:

```powershell
node scripts/simulation-http-smoke.mjs
npm run typecheck
npx vitest run
npx vitest run --config lib/research/engine.vitest.config.ts
npx vitest run --config lib/research/evaluation/vitest.config.ts
```

Results: create/state/topology/start/step/speed/pause/reset/events/metrics all returned 200; deliberately unknown ID returned 404. Typecheck passed. Default tests: 14 passed (including the new regression); engine: 6 passed; evaluation: 5 passed. Total: 25. Research suites still need explicit configs.

Lead also performed real HTTP assertions on a new session: initial time 0, one step gives 0.5, changing legacy speed to 2 then stepping gives 1.5, and reset returns time 0 with empty events. All passed. This verifies existing legacy speed semantics, not the target research engine's pacing-invariance requirement.

## Browser and remaining limits

Luna opened current source at `http://127.0.0.1:3000` for browser retest and observed the initial Creating demo/disabled controls state. The next browser state call was aborted before dispatch; worker stopped UI input under computer-use interruption guidance. No successful post-fix browser control flow or settled screenshots can be claimed. VIS acceptance remains open despite passing HTTP checks. No production build or multi-process test was run.

The dev server was left available for follow-up verification. Broader replay, research integration and visual/accessibility evidence gaps remain in [TODO](TODO.md). The new [AGENTS instructions](../AGENTS.md) require reproducing observed failures in regression tests, proving red/green where possible, and tracking pending automation honestly.
