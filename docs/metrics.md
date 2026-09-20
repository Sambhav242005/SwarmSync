# Metrics

> All values are **simulated estimates, NOT real Android hardware measurements**.

## Categories

- Task: tasks_completed, completion rate per role.
- Collaboration: KNOWLEDGE_SHARED messages, duplicates, conflicts, knowledge items.
- Network: bytes transferred, link up/down transitions, relay decisions.
- Resource: energy_mwh, memory_mb, avg_latency_ms.
- Model: avg_confidence, quality per model_id, quantization tier.
- Robustness: behavior under failure injection (e.g. device down window), rewind consistency (`rebuild(t)` == `up_to(t)`).

## Collector keys (`simulator/metrics/collector.py`)

- `ingest(events)`: `KNOWLEDGE_SHARED` -> `messages+=1`, `bytes += payload.bytes`, `knowledge+=1`; `CONFLICT` -> `conflicts+=1`. Accepts dicts or SimEvent.
- `summary()` returns: `messages, bytes, conflicts, knowledge, tasks_completed (=0 stub), dupes (=0 stub), energy_mwh (=0.0 stub), avg_confidence (=0.0 stub), avg_latency_ms (=0.0 stub)`. Zero stubs are slice placeholders for full aggregation later.

## Run store (`simulator/experiments/store.py`)

- `RunStore.save_run(config, seed, metrics, events)` -> `run_id` (`run_<8hex>`), sqlite `runs(run_id, ts, config JSON, seed, metrics JSON{metrics,events})` at `experiments/runs/runs.db` (makedirs hardcoded, connection not context-managed — deferred hardening).

## API note

- Slice `GET /simulation/{sid}/metrics` returns minimal `{messages: len(log)}`, not full `Collector.summary()` — full Collector wiring deferred per SDD ruling (Task4->Task5). Collector + RunStore covered by `tests/test_metrics_store.py`.
