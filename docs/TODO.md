# SwarmSync TODO

Updated: 31 October 2026. Requirements: [SPEC.md](SPEC.md). Decisions: [DESIGN.md](DESIGN.md). Check a task only with acceptance evidence; literature and design do not establish implementation.

## Completed groundwork

- [x] Inspect code/UI/API/profiles and identify research blockers.
- [x] Establish earlier audit baseline: 13 tests, TypeScript and production build passed. Browser/scientific validation remains pending.
- [x] Save [17-paper review](literature-review-on-device-vision.md), [collaboration notes](literature-collaboration-notes.md) and [BibTeX](literature-review-on-device-vision.bib).
- [x] Research [Android GPU support/capacity](android-gpu-capacity-research.md) and [device examples](android-device-examples.md).
- [x] Research [dataset options](dataset-options.md); inspect CrisisMMD annotation ZIP and verify 2,468/529/529 severity split records with archive hash.
- [x] Specify [context/output budgets and incomplete-response handling](benchmark-and-budget-design.md). Enforcement remains pending.
- [x] Create current spec/design/TODO and refresh stale current-state docs; preserve historical plans with supersession notices.

## First worker wave — verified building blocks (31 October 2026)

These scoped subtasks are complete at source/unit-check level. They do not close the broader P0, SYN or P3 acceptance gates. Evidence and exact verification commands: [worker verification](worker-verification-2026-10-31.md).

- [x] **W1-ENGINE-TIMING:** headless integer-ms scheduling and stable boundary order; tests cover deadline equality, failure at completion/receipt and equal-horizon step partitions. Evidence: `apps/web/lib/research/engine.test.ts` (6 engine tests in total).
- [x] **W1-ENGINE-ISOLATION:** copied local stores, input/snapshot isolation and new reset identity, plus memory rejection fixtures. Scope is the standalone core, not the legacy API or a complete resource model.
- [x] **W1-GENERATOR:** seeded frozen public report traces, separate truth return, declared sensor-error/timing/correlation inputs and false/delay/duplicate/replay/excessive injections. Evidence: generator cases in `apps/web/lib/research/evaluation/evaluation.test.ts`.
- [x] **W1-EVALUATOR:** standalone hand-labeled delivery/correct-on-time, wrong/late/absent/uncertain/conflict, provenance deduplication, latency and supplied-traffic byte metrics. Evidence: evaluator cases in the same test file (5 evaluator/generator tests in total). Caller must keep returned truth private; lifecycle reconciliation and engine adapter remain open.
- [x] **W1-VIEWER-CODE:** connect legacy create/start/pause/step/speed/reset client calls; add pending/error states, device/agent selection, styles and explicit legacy/replay-unavailable labels. Verified by source inspection and typecheck only; browser behavior is not accepted yet.

Lead verification: `npm run typecheck` passed; default Vitest passed 13 tests; explicit engine config passed 6; explicit evaluation config passed 5. Default Vitest does not discover the new research suites. No production build, browser session or independent advisor review was performed in this wave.

### Remaining integration and acceptance work

- [ ] **W2-CONTRACT:** adapt generator reports to engine input and engine deliveries to evaluator input; validate allowed labels and required timestamps/evidence fields. Keep truth outside policy inputs; exercise an end-to-end hand-computable fixture.
- [ ] **W2-TEST-DISCOVERY:** include research suites in the normal test command/configuration without silently dropping the existing 13 tests.
- [ ] **W2-POLICIES:** implement and verify distinct selective sharing and scheduling baselines; current SELECTIVE follows the direct-delivery path. Freeze policy versions before comparisons.
- [ ] **W2-TRANSPORT:** measure encoded bytes, add ACK/control accounting, one deadline-bounded retry and specified recovery/requeue behavior.
- [ ] **W2-REPLAY:** replace checkpoint-only history with independently reconstructible event replay, including queues and resources.
- [ ] **W2-EXPORT:** persist/finalize manifests, events, metrics and interrupted status; independently reconcile traffic records and evaluator outcomes.
- [ ] **W2-SENSING:** strengthen non-extreme error/correlation and actual multi-hop provenance tests; complete SYN acceptance and evidence-reference validation. Permission/time-limit rules remain unimplemented.
- [ ] **W2-VIEWER:** integrate research snapshots, single server ownership and consistent reads; verify browser controls, errors, teardown and accessibility. Current playback is client-paced legacy behavior; no multi-tab guarantee.
- [ ] **W2-REVIEW:** independent Terra advisor review of substantial implementation, resolve findings, then integrated typecheck/test/build and relevant browser checks. Lead verification so far is bounded source/test inspection, not final scientific acceptance.

## P0 — Scientific correctness blockers

Complete before comparative research collection.

- [ ] **P0-01 Tasks/evaluator:** schema-2 sample/task/output contracts and evaluator-only truth; distinguish delivered/correct/on-time/uncertain/late/incomplete. **Accept:** hand-labeled cases cannot succeed merely by reaching an agent state.
- [ ] **P0-02 Scheduling:** logical-time jobs, stable tie ordering, isolated RNG streams and pacing invariance. **Accept:** equal-horizon logs/state match across speed/step partition; exact outage/deadline boundaries tested.
- [ ] **P0-03 Local knowledge:** per-agent immutable copies and receipt-driven remote access. **Accept:** offline/private-store leakage and alias-mutation tests pass.
- [ ] **P0-04 Inference/resources:** timed admission/queues, memory reservations, artifact compatibility and profile provenance. **Accept:** slow/unsupported/OOM/failure cases affect outcomes without invented completion; normalized capability averages are not used for research profiles.
- [ ] **P0-05 Transport:** encoded bytes, serialization/propagation/loss, queues, acknowledgement, bounded retry and recovery. **Accept:** hand-computed packets arrive at due time or explicitly drop; offline links never instant-deliver.
- [ ] **P0-06 Replay/reset:** full state reducer, historical reads and new run identity on reset. **Accept:** replay/live equivalence; scrub does not mutate live state; reset/fresh seeded runs match.
- [ ] **P0-07 Metrics/export:** replace placeholder zeros, define units/denominators/nullability, persist manifest/JSONL/metrics. **Accept:** independent evaluation reproduces fixture metrics and charges failures/retries.

## Deferred P1 — Dataset and executable-model integration

Reference backlog only. None of the following P1 tracks is required by the initial synthetic study.

- [ ] **P1-01 Photograph data:** acquire creator-linked CrisisMMD images, inspect terms, retain hashes and freeze severity manifests. **Accept:** reproducible valid/missing/corrupt counts and duplicate/event-leakage report.
- [ ] **P1-02 Perception baseline:** pin mobile classifier/head/preprocessing; fit/evaluate held-out damage severity. **Accept:** actual predictions with macro-F1/per-class recall/confusion matrix and no labels leaked to agents.
- [ ] **P1-03 Satellite data/model:** acquire xBD, verify terms/splits, implement paired transforms and official scoring. **Accept:** independently reproducible satellite results, no pooled modality accuracy.
- [ ] **P1-04 Language candidate:** pin checkpoint/tokenizer/template, convert and verify runtime/backend/memory. Candidate cards are not installed models. **Accept:** reproducible inference and quality/compatibility report on a declared platform.
- [ ] **P1-05 Context admission:** enforce 4,096 total, 128 margin, 512 local / 1,024 coordinator generation. **Accept:** exact-fit/one-token-over, Unicode, templates, history and thinking-token cases.
- [ ] **P1-06 Output contract:** bounded schema/instructions, runtime caps, stop telemetry, validation and provisional streams. **Accept:** cap/context/timeout/cancel/malformed/unknown termination never commits a successful result.
- [ ] **P1-07 Recovery:** at most one smaller regeneration within original deadline and cumulative budget. **Accept:** both attempts charged; unresolved output explicitly incomplete.
- [ ] **P1-08 Optional drone track:** verify RescueNet terms/masks, transforms/stitching and class metrics after main tracks work. **Accept:** separate IoU/recall and flight/spatial split notes.

## Synthetic sensing and adversary requirements

- [ ] **SYN-01 Observation generator:** seeded reports with explicit false-positive, false-negative, timing and correlation assumptions. **Accept:** fixed-seed fixtures and declared parameter ranges.
- [ ] **SYN-02 Compromised reports:** false, replayed, duplicated, delayed and excessive report scenarios. **Accept:** provenance survives relays; duplicates never count as independent corroboration.
- [ ] **SYN-03 Access rules:** permissions and incident/time limits, including misuse attempts. **Accept:** modeled allow/deny cases pass and evidence limits are documented.
- [ ] **SYN-04 Uncertainty:** preserve contradictions and distinguish missing evidence from negative evidence. **Accept:** evaluator fixtures cover conflicts, uncertainty and absence.

## P2 — Policy comparison and paper evidence

- [ ] **P2-01 Baselines:** `LOCAL_ONLY`, `DIRECT`, `FULL`, `SELECTIVE` with permitted local information only. **Accept:** identical fixed predictions/external traces and a direct-delivery comparator beside flooding.
- [ ] **P2-02 Batch runner:** fixed schedule/horizon/network/outages and identifiable interrupted runs. **Accept:** unique artifacts and independent metric recomputation per run.
- [ ] **P2-03 Error separation:** synthetic observation errors, communication failures and evidence-validation decisions. **Accept:** attributable errors and no evaluator-truth leakage into ordinary policies; executable perception/language comparisons remain deferred.
- [ ] **P2-04 Pilot/freeze:** separate pilot seeds; freeze splits/profiles/policies/thresholds/horizon/final seed count (initial default 30 paired seeds). **Accept:** versioned protocol and hashes before final collection.
- [ ] **P2-05 Final study:** report useful throughput, quality, misses/false alarms, latency/freshness, bytes, memory, incomplete outcomes and energy provenance. **Accept:** paired confidence intervals, failed runs and source artifacts for every figure.
- [ ] **P2-06 Ablations:** isolate sharing, scheduling and evidence-validation factors; sweep sensor error, disruption and compromised-device conditions. **Accept:** no attribution mixes changed factors; exact ranges are frozen before collection.
- [ ] **P2-07 Reproduction:** instructions, lockfile/environment, evaluator, manifests, permissible fixtures and limitations. **Accept:** fresh checkout reproduces a small reference run without improperly bundling data/models.
- [ ] **P2-08 Novelty and manuscript:** update related work around communication and evidence validation, resolve novelty limits, and write a venue-neutral manuscript with bibliography and reproducibility appendix. **Accept:** empirical claims trace to saved artifacts; limitations are explicit. Do not submit the manuscript.

## P3 — Viewer and interactive ownership

- [ ] **P3-01 API/schema-2:** legacy adapter, typed snapshots, serialized/idempotent commands and real HTTP cross-route tests. **Accept:** two tabs cannot double-advance a run or duplicate work.
- [ ] **P3-02 Controls/styles:** connect create/play/pause/step/speed/reset; implement styles/loading/errors/teardown. Preserve unrelated untracked Controls work. **Accept:** browser workflow with actual telemetry.
- [ ] **P3-03 World/inspector:** agents/devices/links/resources, event-backed packets, selection/evidence/causality. **Accept:** displayed values agree with one engine snapshot.
- [ ] **P3-04 Timeline/lenses:** reconstruct history and distinguish replay/live overlays. **Accept:** scrub is consistent and never mutates live outcomes.

## Visual and UX acceptance — pending runtime verification

Required by [AGENTS.md](../AGENTS.md); procedure: [visual testing protocol](visual-testing.md). Apply premium-app-ux and ui-ux-pro-max for viewer work.

Historical pre-fix Luna runtime audit performed: [31 October report](visual-testing/luna-audit-2026-10-31.md). Worker inspected desktop 1440 x 900 and mobile 390 x 844; device/agent/event selection and inspector close worked. Step failed initially, then succeeded once after reload (0.5 s, 13 events). Initial load, Play, speed and Reset encountered `404: unknown simulation`; creating a new demo recovered load but not reliable commands. Root cause unconfirmed. Keyboard/contrast checks were partial; zoom, reduced motion and screen reader remain untested. Screenshots were inspected in browser output but not persisted. Lead reviewed the written report, not independent screenshot evidence; broad visual/accessibility gates remain open. The later [fresh browser retest](visual-testing/luna-retest-2026-10-31.md#fresh-retest-after-interrupted-attempt--assignment-visual-retest-02) supersedes the failed core-control result; mobile post-fix and persisted screenshots remain unverified.

- [x] **REG-01 Session regression (API scope):** Luna reproduced create=200/state=404 and a red cross-module test; fixed module-local registry with process-shared `globalThis` storage. Lead reviewed source/test and independently passed HTTP smoke plus state assertions, typecheck and 25 tests. Evidence: [session fix record](session-fix-verification-2026-10-31.md). Browser-control acceptance remains open separately under VIS-BUG-01; no multi-process or durable ownership claim.
- [x] **VIS-BUG-01 Command/session reliability (bounded dev workflow):** cross-module registry cause reproduced and fixed; lead independent HTTP commands/state assertions pass. Fresh Luna browser retest observed successful Create/Play/Pause/paused Step/2x selection/Reset and matching device/event selection without visible 404. Lead reviewed [the actual retest sequence](visual-testing/luna-retest-2026-10-31.md#fresh-retest-after-interrupted-attempt--assignment-visual-retest-02). Reset returned time/events/selection to initial state while preserving 2x. This closes the observed dev-control bug, not broader visual/accessibility/production acceptance.
- [ ] **VIS-EVIDENCE-01 Captures and retest:** persist desktop/mobile state screenshots using a supported capture mechanism; lead inspects captures and reruns critical controls after fixes.


- [ ] **VIS-01 Desktop/mobile:** inspect current-source viewer at 1440 x 900 and 390 x 844; save and inspect screenshots for loading, settled, selected and error states; verify no clipping/overlap.
- [ ] **VIS-02 Journey (remaining edge cases):** core create/play/pause/step/speed/reset and device/event selection passed in fresh Luna retest; pending duplicate-command prevention, complete agent/recovery edge cases and independent persisted visual evidence remain to verify.
- [ ] **VIS-03 Recovery/return:** test a relevant local API interruption, available recovery and reopen behavior; verify truthful errors, preserved context and no duplicate operations.
- [ ] **VIS-04 Accessibility:** keyboard/focus/order, labels, status/error announcement evidence, measured contrast, zoom/reflow and reduced motion where applicable. Explicitly label screen-reader checks not performed.
- [ ] **VIS-05 Evidence review:** lead reviews screenshots and recorded interactions, resolves blocking findings, and links the report here. Unit/type/build checks cannot close these visual gates.

## Later — Hardware and scale

- [ ] **HW-01 Device scope:** acquire phones; record SoC/RAM/OS and sampling scope without calling selected examples a population average.
- [ ] **HW-02 Native inference:** pin artifacts and measure actual CPU/GPU/NPU placement, precision/fallback, quality and memory; review deprecated NNAPI assumptions.
- [ ] **HW-03 Sustained evidence:** repeated cold/warm/sustained sessions with temperature, end-to-end timing, throughput, RAM and energy provenance. **Accept:** peak/synthetic values are never labeled sustained Android measurements.
- [ ] **HW-04 Calibration:** evaluate prediction error on held-out measured runs and retain original synthetic study provenance.
- [ ] **EXT-01 Scale:** validate 12/24 devices, differing agent/device counts, queue/log limits and contention after the six-device reference passes.
- [ ] **EXT-02 Model splitting:** separate tile/feature-partition study with actual synchronization, transfer and failure costs; do not multiply paper speedups.

## Completion rule

Initial simulator readiness requires P0, SYN requirements, a validated synthetic reference run and essential P3 workflows. Paper readiness also requires P2, a frozen protocol, final reproducible artifacts and a manuscript. P1, HW and EXT work is deferred. Real Android claims require separate HW evidence. Historical checked items above are records of earlier work, not newly verified results.
