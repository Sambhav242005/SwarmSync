# SwarmSync TODO

Updated: 25 October 2026. Requirements: [SPEC.md](SPEC.md). Decisions: [DESIGN.md](DESIGN.md). Check a task only with acceptance evidence; literature and design do not establish implementation.

## Completed groundwork

- [x] Inspect code/UI/API/profiles and identify research blockers.
- [x] Establish earlier audit baseline: 13 tests, TypeScript and production build passed. Browser/scientific validation remains pending.
- [x] Save [17-paper review](docs/literature-review-on-device-vision.md), [collaboration notes](docs/literature-collaboration-notes.md) and [BibTeX](docs/literature-review-on-device-vision.bib).
- [x] Research [Android GPU support/capacity](docs/android-gpu-capacity-research.md) and [device examples](docs/android-device-examples.md).
- [x] Research [dataset options](docs/dataset-options.md); inspect CrisisMMD annotation ZIP and verify 2,468/529/529 severity split records with archive hash.
- [x] Specify [context/output budgets and incomplete-response handling](docs/benchmark-and-budget-design.md). Enforcement remains pending.
- [x] Create current spec/design/TODO and refresh stale current-state docs; preserve historical plans with supersession notices.

## P0 — Scientific correctness blockers

Complete before comparative research collection.

- [ ] **P0-01 Tasks/evaluator:** schema-2 sample/task/output contracts and evaluator-only truth; distinguish delivered/correct/on-time/uncertain/late/incomplete. **Accept:** hand-labeled cases cannot succeed merely by reaching an agent state.
- [ ] **P0-02 Scheduling:** logical-time jobs, stable tie ordering, isolated RNG streams and pacing invariance. **Accept:** equal-horizon logs/state match across speed/step partition; exact outage/deadline boundaries tested.
- [ ] **P0-03 Local knowledge:** per-agent immutable copies and receipt-driven remote access. **Accept:** offline/private-store leakage and alias-mutation tests pass.
- [ ] **P0-04 Inference/resources:** timed admission/queues, memory reservations, artifact compatibility and profile provenance. **Accept:** slow/unsupported/OOM/failure cases affect outcomes without invented completion; normalized capability averages are not used for research profiles.
- [ ] **P0-05 Transport:** encoded bytes, serialization/propagation/loss, queues, acknowledgement, bounded retry and recovery. **Accept:** hand-computed packets arrive at due time or explicitly drop; offline links never instant-deliver.
- [ ] **P0-06 Replay/reset:** full state reducer, historical reads and new run identity on reset. **Accept:** replay/live equivalence; scrub does not mutate live state; reset/fresh seeded runs match.
- [ ] **P0-07 Metrics/export:** replace placeholder zeros, define units/denominators/nullability, persist manifest/JSONL/metrics. **Accept:** independent evaluation reproduces fixture metrics and charges failures/retries.

## P1 — Dataset and executable-model integration

Acquisition can run alongside P0; experiments require the correctness gates.

- [ ] **P1-01 Photograph data:** acquire creator-linked CrisisMMD images, inspect terms, retain hashes and freeze severity manifests. **Accept:** reproducible valid/missing/corrupt counts and duplicate/event-leakage report.
- [ ] **P1-02 Perception baseline:** pin mobile classifier/head/preprocessing; fit/evaluate held-out damage severity. **Accept:** actual predictions with macro-F1/per-class recall/confusion matrix and no labels leaked to agents.
- [ ] **P1-03 Satellite data/model:** acquire xBD, verify terms/splits, implement paired transforms and official scoring. **Accept:** independently reproducible satellite results, no pooled modality accuracy.
- [ ] **P1-04 Language candidate:** pin checkpoint/tokenizer/template, convert and verify runtime/backend/memory. Candidate cards are not installed models. **Accept:** reproducible inference and quality/compatibility report on a declared platform.
- [ ] **P1-05 Context admission:** enforce 4,096 total, 128 margin, 512 local / 1,024 coordinator generation. **Accept:** exact-fit/one-token-over, Unicode, templates, history and thinking-token cases.
- [ ] **P1-06 Output contract:** bounded schema/instructions, runtime caps, stop telemetry, validation and provisional streams. **Accept:** cap/context/timeout/cancel/malformed/unknown termination never commits a successful result.
- [ ] **P1-07 Recovery:** at most one smaller regeneration within original deadline and cumulative budget. **Accept:** both attempts charged; unresolved output explicitly incomplete.
- [ ] **P1-08 Optional drone track:** verify RescueNet terms/masks, transforms/stitching and class metrics after main tracks work. **Accept:** separate IoU/recall and flight/spatial split notes.

## P2 — Policy comparison and paper evidence

- [ ] **P2-01 Baselines:** `LOCAL_ONLY`, `DIRECT`, `FULL`, `SELECTIVE` with permitted local information only. **Accept:** identical fixed predictions/external traces and a direct-delivery comparator beside flooding.
- [ ] **P2-02 Batch runner:** fixed schedule/horizon/network/outages and identifiable interrupted runs. **Accept:** unique artifacts and independent metric recomputation per run.
- [ ] **P2-03 Error separation:** perception; oracle-evidence coordination; predicted-evidence coordination; complete swarm; rule-based versus language coordinator. **Accept:** attributable errors and no oracle leakage into ordinary runs.
- [ ] **P2-04 Pilot/freeze:** separate pilot seeds; freeze splits/profiles/policies/thresholds/horizon/final seed count (initial default 30 paired seeds). **Accept:** versioned protocol and hashes before final collection.
- [ ] **P2-05 Final study:** report useful throughput, quality, misses/false alarms, latency/freshness, bytes, memory, incomplete outcomes and energy provenance. **Accept:** paired confidence intervals, failed runs and source artifacts for every figure.
- [ ] **P2-06 Ablations:** isolate inference adaptation and sharing adaptation, include scheduler/encoding costs. **Accept:** no attribution mixes changed factors.
- [ ] **P2-07 Reproduction:** instructions, lockfile/environment, evaluator, manifests, permissible fixtures and limitations. **Accept:** fresh checkout reproduces a small reference run without improperly bundling data/models.
- [ ] **P2-08 Novelty check:** retrieve inaccessible ARIA/Phoenix/viNPU full texts and update related work before submission. Existing 17-paper notes are not an exhaustive October-2026 review.

## P3 — Viewer and interactive ownership

- [ ] **P3-01 API/schema-2:** legacy adapter, typed snapshots, serialized/idempotent commands and real HTTP cross-route tests. **Accept:** two tabs cannot double-advance a run or duplicate work.
- [ ] **P3-02 Controls/styles:** connect create/play/pause/step/speed/reset; implement styles/loading/errors/teardown. Preserve unrelated untracked Controls work. **Accept:** browser workflow with actual telemetry.
- [ ] **P3-03 World/inspector:** agents/devices/links/resources, event-backed packets, selection/evidence/causality. **Accept:** displayed values agree with one engine snapshot.
- [ ] **P3-04 Timeline/lenses:** reconstruct history and distinguish replay/live overlays. **Accept:** scrub is consistent and never mutates live outcomes.

## Later — Hardware and scale

- [ ] **HW-01 Device scope:** acquire phones; record SoC/RAM/OS and sampling scope without calling selected examples a population average.
- [ ] **HW-02 Native inference:** pin artifacts and measure actual CPU/GPU/NPU placement, precision/fallback, quality and memory; review deprecated NNAPI assumptions.
- [ ] **HW-03 Sustained evidence:** repeated cold/warm/sustained sessions with temperature, end-to-end timing, throughput, RAM and energy provenance. **Accept:** peak/synthetic values are never labeled sustained Android measurements.
- [ ] **HW-04 Calibration:** evaluate prediction error on held-out measured runs and retain original synthetic study provenance.
- [ ] **EXT-01 Scale:** validate 12/24 devices, differing agent/device counts, queue/log limits and contention after the six-device reference passes.
- [ ] **EXT-02 Model splitting:** separate tile/feature-partition study with actual synchronization, transfer and failure costs; do not multiply paper speedups.

## Completion rule

Application readiness requires P0, selected P1 tracks, a validated reference run and essential P3 workflows. Paper readiness also requires frozen protocol and final reproducible artifacts. Real Android claims require HW evidence. A build or polished UI alone satisfies neither research gate.
