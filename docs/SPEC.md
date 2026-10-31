# SwarmSync specification

Updated: 31 October 2026. Status: current working specification; target behavior is pending unless checked in [TODO.md](TODO.md).

This file defines requirements. [DESIGN.md](DESIGN.md) defines implementation decisions; [TODO.md](TODO.md) tracks work and acceptance evidence. These files supersede conflicting guidance in historical `docs/superpowers/` plans. Research notes are evidence and proposals, not proof of implemented capabilities.

## Purpose and scope

Investigate the tradeoff between correct perception results delivered before deadlines and device/communication cost under network disruption. Compare communication strategies, then isolate the effect of optional local-inference adaptation and language coordination. No novelty or superiority is established in advance.

The initial paper is simulation-based, with six devices and generated sensor reports. Compare LOCAL_ONLY, DIRECT, FULL and SELECTIVE sharing with scheduling baselines and fixed traces. Model false, replayed, duplicated, delayed and excessive reports, retain original provenance, and expose uncertainty and conflicting evidence. Permissions and incident/time limits are simulator rules only. Preserve the existing TypeScript application architecture. Real sensing, deployment, Android measurements, photo/satellite pipelines and coordinator fine-tuning are deferred. See the authoritative [current scope](RESEARCH-COMPLETION-PLAN.md#current-scope--research-paper-and-simulator-only).

## Current baseline

The application uses Next.js, React, TypeScript, Phaser and Zustand. The simulation and API are TypeScript under `apps/web`; Python/FastAPI was removed. The earlier audit passed 13 tests, type checking and production build, but browser functionality and scientific validity remain unverified.

Present blockers: unwired UI, one global knowledge store, inference estimates without scheduled execution, descriptive rather than enforced bandwidth/delay/loss, scripted completion, incomplete resource metrics, in-memory-only sessions and event filtering rather than state replay. Real checkpoints, image datasets and an Android runner are not integrated.

## Synthetic observations and task requirements

The initial study uses generated observations with declared false-positive, false-negative, timing and correlation assumptions. Sweep sensor error, network disruption and compromised-device conditions. Preserve provenance through relays; duplicate reports are not independent support. Missing reports do not prove absence. TASK requirements below apply now; DATA requirements describe deferred external-data extensions.

| ID | Requirement |
|---|---|
| DATA-1 | Initial photograph task: CrisisMMD v2 three-class image severity. Released annotations were inspected: 2,468 train / 529 dev / 529 test. Mixed social-media viewpoints must not be described as exclusively phone-captured. |
| DATA-2 | Satellite task: xBD/xView2 pre/post building localization and four-grade damage. Verify acquired release, terms, splits and labels. Keep its scores separate from photograph classification. |
| DATA-3 | Optional drone task: RescueNet damage/road segmentation, with dataset terms checked independently of its code license. |
| DATA-4 | Store release/source/license, hashes, file/split manifests, transforms and missing/corrupt counts. Preserve related scenes, duplicates and pre/post pairs in additional grouped holdouts. |
| TASK-1 | Tasks identify samples, task namespace, arrival/deadline, required destination and output contract. Ground truth is evaluator-only. |
| TASK-2 | Distinguish delivery, correctness and on-time success. Uncertain, wrong, late, absent, interrupted and malformed results are separate outcomes. State-machine position alone never proves completion. |
| TASK-3 | Static-corpus device assignment, arrival schedules and wireless conditions are explicitly synthetic. Unrelated photographs are not matched views of one entity. |

Sources and acquisition details: [dataset options](dataset-options.md). Generic COCO detections are not a trained disaster-severity head.

## Simulation and communication requirements

| ID | Requirement |
|---|---|
| SIM-1 | Engine-owned state, deterministic event ordering and isolated seeded external traces. Same scientific horizon yields the same results regardless of polling or playback speed. |
| SIM-2 | Inference and transmission have queues/start/completion times. Memory, capacity, serialization, propagation, loss and failures affect outcomes. |
| SIM-3 | Local knowledge only; remote observations become available after receipt. Policies cannot read private remote stores or hidden labels. |
| SIM-4 | Outages abort/reject affected work explicitly. Recovery does not invent completion. Replay reconstructs queues, knowledge, resources, links and tasks. |
| SIM-5 | Reset starts a new run identity; finalized previous artifacts are immutable. |
| COMM-1 | Minimum baselines: direct delivery without peer replication, full sharing and selective sharing. Local-only/no-network is a diagnostic baseline, not the only comparator. |
| COMM-2 | Account for encoded payload, control/acknowledgement, duplicate and retry traffic; report attempts, receipts and drops separately. |
| COMM-3 | Freeze each policy and compare under identical predictions/workload/external traces. No implicit improvement claim solely from beating flooding. |

## Models, Android and resources

Synthetic service-time, memory and quality profiles support the initial study and must be labeled as assumptions. Executable-model qualification and Android requirements below apply only if those deferred extensions are activated; they are not initial release gates.

- **MODEL-1:** Pin checkpoint/head, revision, conversion hash, input normalization, precision, runtime/backend and compatibility. Profile names alone are not executable models.
- **MODEL-2:** Mark profiles `synthetic`, `paper-derived` or `measured`, with uncertainty and operating conditions. Use task-specific service-time/memory/quality records rather than averaged CPU/GPU/NPU scores.
- **ANDROID-1:** Validate actual CPU/GPU/NPU use and graph fallback. INT8 storage does not guarantee native integer GPU execution. Review legacy NNAPI labels before new Android deployment.
- **MEM-1:** Distinguish physical/available RAM, process/GPU allocations, weights, activations/workspace and KV cache. Avoid counting shared memory twice or storage-backed extension as DRAM.
- **MEM-2:** Initial synthetic levels are 4/6/8/12 GB, with 8 GB the middle planning case. They are not population averages or per-app allocations.
- **ENERGY-1:** Define units/conversions and provenance. Unknown measurements are unavailable, not zero. No unexplained percent-per-mWh constants.

Evidence: [Android support/capacity](android-gpu-capacity-research.md), [device examples](android-device-examples.md), [17-paper review](literature-review-on-device-vision.md).

## Context and complete outputs

Deferred executable-language-model extension. These requirements apply when a real language runtime is introduced; the initial synthetic study does not require one.

Effective context is the minimum of checkpoint, converted artifact, runtime and device-validated limits. Vision tensor/image limits are separate from language tokens. Pin tokenizer/template and count all rendered input before each call.

| Role | Total context | Maximum input | Generated-token cap | Margin |
|---|---:|---:|---:|---:|
| Local language agent | 4,096 | 3,456 | 512 | 128 |
| Language coordinator | 4,096 | 2,944 | 1,024 | 128 |

These are starting application policies awaiting validation, not model/hardware maxima. Reasoning consumes the generated allowance. The compact baseline uses verified non-thinking execution and no automatic tool loop.

- **BUDGET-1:** Enforce `rendered input + requested generation + margin <= effective context`; re-pack oversized evidence or create smaller atomic jobs before execution.
- **BUDGET-2:** Give the model bounded schema/evidence/brevity instructions and enforce runtime caps. Prompt instructions do not guarantee completion.
- **BUDGET-3:** Validate termination, schema, task ID, labels and evidence references before committing/sharing. Stream fragments remain provisional.
- **BUDGET-4:** Record natural/grammar completion, cap/context stop, timeout, cancellation, invalid output and runtime failure. Unknown termination cannot silently be accepted as success.
- **BUDGET-5:** At most one smaller regeneration within the original deadline and cumulative task budget. Charge all attempts; otherwise return incomplete. Do not blindly concatenate broken JSON.

The guarantee is no silent cutoff counted as success, not that arbitrary work always fits. Details: [budget design](benchmark-and-budget-design.md).

## Evaluation and release gates

Primary system metric: unique correct results received at the required destination by deadline / full observation seconds. Also report coverage, false reports, missed results, misses/false alarms, abstention/incomplete/late counts, p50/p95 latency/freshness, bytes, peak memory and energy provenance.

Separate observation-generation assumptions from communication and evidence-validation outcomes. Keep evaluator truth inaccessible to policies. External perception and language-coordination experiments are deferred and require separate protocols if activated.

Use pilot seeds separate from final seeds; start with 30 paired final seeds per frozen condition. Freeze splits, policies, thresholds, horizon and trace schedules before final collection. Report paired confidence intervals and failed runs. Export versioned manifests, configuration/profile/data hashes, revision, seeds, events, metrics and termination reasons; independently recompute metrics.

Release gates:

1. **Verified simulation:** hand-computable timing/delivery/resource fixtures, seed/reset/replay equivalence, pacing invariance and no knowledge leakage.
2. **Synthetic input qualification:** versioned generators, declared sensing/adversary assumptions, isolated seeds and frozen external traces. External dataset/model integration is deferred.
3. **Research collection:** frozen baselines/protocol, complete paired-run exports and independent evaluation. No final result claims before these pass.
4. **Demonstration:** controls, world, inspector, timeline and metrics agree with real snapshots; no hardcoded research telemetry.
5. **Deferred Android evidence:** native backend/accuracy/memory/thermal/sustained-throughput measurements, separately labeled from simulation. No phone claims before this stage.
