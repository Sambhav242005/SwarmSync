# Metrics

> Scope reviewed 31 October 2026: this describes the previously inspected demo or proposed interfaces, not newly verified implementation. The [current synthetic-study scope](RESEARCH-COMPLETION-PLAN.md) governs; schema-2 behavior remains pending acceptance evidence.

Updated: 25 October 2026. Distinguish existing counters from [SPEC requirements](SPEC.md#evaluation-and-release-gates) and [target implementation](DESIGN.md#metrics-viewer-and-validation).

## Current counters

`apps/web/lib/sim/collector.ts` counts sharing messages/declared payload bytes, conflicts and deduplicated creation markers. `knowledge` increments on sharing, not unique insertion. Task completion, energy, mean confidence and mean latency return zero in the collector.

The metrics route processes the full log, overrides completion with a `task_completed` event count and adds `sim_time`. This is a scripted-event count, not correctness. Resource zeros are placeholders; declared payload sizes are not independently validated wire-byte measurements. Existing tests do not establish metric validity. No Python/SQLite run store remains active.

## Research measurements to implement

| Measurement | Definition |
|---|---|
| Useful throughput | Unique correct results received at required destination by deadline / full observation seconds |
| Completion/coverage | Structurally delivered and correct/on-time results separately against eligible tasks |
| Task quality | Per-dataset macro-F1/recall, detection AP or mask IoU; retain misses, false alarms and uncertainty |
| Latency/freshness | Arrival/capture to receipt and observation age; p50/p95 plus late/undelivered counts |
| Communication | Encoded payload/control/retry bytes; attempts/receipts/drops/duplicates separately |
| Resources | Peak memory without shared-allocation double counting; energy units/provenance explicit |
| Generation reliability | Input/generated tokens, retries, cap/context stops, timeouts and schema errors |

Unavailable values are nullable, not zero. Independently recompute metrics from events. Retain failures/retry costs; do not count duplicate deliveries as unique tasks or synthetic confidence as accuracy.
