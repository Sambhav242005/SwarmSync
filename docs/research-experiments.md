# Research experiments

> All results are **simulated estimates, NOT real Android hardware measurements**. No single "best score" is claimed — strategies are compared across dimensions.

## Run record

- Each run: `run_id` (`run_<8hex>` from `RunStore.save_run`), `config` (scenario_id + strategy + weights + seed JSON), `seed`, full event `log`. Stored sqlite `experiments/runs/runs.db`, table `runs(run_id, ts, config, seed, metrics{metrics,events})`.

## Repro

- Same `seed` replays same `TICK.rng` stream and same inference jitter/noise modulo the `hash(model_id)` per-process-salt caveat (use `PYTHONHASHSEED=0` for cross-process runs). `rebuild(t)` gives time-travel scrub for post-hoc analysis.

## 5 strategies comparison dimensions

1. Flooding (share-all): tasks_completed vs messages/bytes blowup.
2. Utility-gated relay (`U = wr*rel + wi*gain + wu*unc - wb*cost`): conflicts/dupes vs coverage.
3. Range-gated (`link_up`, range_m): delivery under intermittent links vs isolation.
4. Quantization tier (FP32/FP16/INT8/INT4 factors): avg_latency_ms/energy_mwh vs avg_confidence/quality.
5. Failure-aware (failures windows e.g. android_04 at 60 for 20s): robustness (completion during outage) vs overhead.

Compare per run: `Collector.summary()` keys + latency/energy/confidence means + robustness note. Report deltas, not winners.

## Appendix: accepted plan-list deltas (from SDD reviews)

- `KnowledgeStore`: `insert` returns `inserted/updated/duplicate`; extras `updated` dict field and `find(knowledge_id)` accepted (backward-compatible versioning enhancement).
- `Agent`/engine inits, `tsconfig/next/layout/api` wiring, `.gitignore` hygiene (pycache, tsbuildinfo, .next/out, next-env.d.ts), `package-lock` untracked repro via `npm install` — accepted per ledger rulings.
- Slice metrics endpoint returns `{messages: len}` stub; full Collector wiring deferred.
- Frontend verification via `tsc`/`next build`, engine via pytest with `PYTHONPATH=root` (bare pytest hits stale 3.10).
