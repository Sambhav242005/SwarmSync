# First worker wave: verification record

Recorded: 31 October 2026. Three Terra/high worker assignments delivered code; observed model/effort telemetry and token/cache counters are unavailable. Router: one Luna/low consultation. Advisor: zero. No claim of final acceptance or completed research experiments.

## What changed and how it was checked

| Worker | Files | Lead evidence | Limits |
|---|---|---|---|
| Engine | `apps/web/lib/research/engine.ts`, `engine.types.ts`, `engine.test.ts`, `engine.vitest.config.ts` | Read engine implementation and all six tests; independently reran focused suite and typecheck | Fixed traces and declared payload sizes; checkpoint history; no ACK/retry/export; SELECTIVE is direct-only |
| Evaluation | `apps/web/lib/research/evaluation/` | Read generator, evaluator and all five tests; independently reran focused suite | Standalone types need adapter; caller protects truth; traffic is supplied, not independently reconciled |
| Viewer | `apps/web/app/page.tsx`, `layout.tsx`, `globals.css`, `components/Controls.tsx`, `Hud.tsx`, `Timeline.tsx`, `lib/api.ts` | Read page control/pacing/refresh flow; independently reran typecheck and 13 existing regression tests | Existing regression tests do not validate browser controls; separate reads/client pacing remain; no browser/accessibility validation |

Engine fixtures check a 5 ms job plus 10-byte serialization at 8,000 bit/s plus 5 ms propagation, arriving exactly at a 20 ms deadline. Other cases check failure at completion, link failure at receipt, copied store/history isolation, step-partition equivalence/reset identity and oversized memory rejection. These fixtures support those specific cases, not exhaustive timing or resource correctness.

Evaluation fixtures check repeatability/frozen reports, extreme sensor errors and injected copies, manually specified metric totals, forged/conflicting provenance, and uncertain/absent evidence. They do not establish calibrated sensing, complete evidence validation or statistical independence of different origins. Correct-on-time currently means at least one correct report reached the destination; it is not a validated destination decision under conflicting evidence.

## Commands independently executed by the lead

Run from `apps/web` during the status check:

```powershell
npm run typecheck
npx vitest run
npx vitest run --config lib/research/engine.vitest.config.ts
npx vitest run --config lib/research/evaluation/vitest.config.ts
```

Results: typecheck passed; 13 existing + 6 engine + 5 evaluation tests passed (24 total). The research suites require their explicit configs. Source inspection was then performed during the TODO update. No implementation changed between these checks and this record. Production build, browser checks, end-to-end research integration and independent advisor review were not run.

See [TODO](TODO.md#first-worker-wave--verified-building-blocks-31-october-2026) for checked scoped subtasks and open integration gates. Passing checks never substitute for missing acceptance criteria.
