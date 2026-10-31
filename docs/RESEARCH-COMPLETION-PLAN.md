# SwarmSync research completion plan

Date: 31 October 2026. Status: proposal for discussion; not implementation evidence.

Detailed feature inventory, environment/network requirements, priorities, and candidate skills: [Simulator feature roadmap](simulator-feature-roadmap.md).

## Current scope — research paper and simulator only

Agreed scope reduction: build a simulation-based study and its manuscript. This section supersedes the broader implementation roadmap below wherever they conflict. That roadmap is retained as discussion history, not authorization to implement every extension. SPEC.md, DESIGN.md, and TODO.md were reconciled to this reduced scope on 31 October 2026. The exact experimental protocol remains to be agreed and frozen.

### Research question

Proposed working question: under unreliable connectivity and potentially compromised devices, how do communication and evidence-validation policies affect the delivery of correct, timely disaster-response observations?

The primary study remains communication and coordination. False reports and access misuse are bounded simulation scenarios; a claim of a new security or privacy mechanism requires a separately specified mechanism and evaluation. Novelty is not yet established.

### Deliverables

- A deterministic simulator with six devices initially, local knowledge, queued inference and transmission, failures, deadlines, replay, and reproducible exports.
- A usable research viewer showing devices, messages, provenance, uncertainty, outcomes, and experiment comparisons.
- Controlled comparisons of local-only, direct, full, and selective sharing, with scheduling baselines and fixed input traces.
- An evaluator that alone sees simulation ground truth and independently computes correct on-time delivery, false reports, missed results, latency, and communication cost.
- A frozen experimental protocol, saved results, analysis, figures, and a venue-neutral manuscript with limitations.

### Simulated sensing and adversaries

- Represent human-presence or disaster observations as generated sensor reports with explicit false-positive, false-negative, timing, and correlation assumptions. Any Wi-Fi-like sensing is an abstract observation model, not a radio propagation model or demonstrated Wi-Fi detector.
- Model compromised devices by injecting false, replayed, duplicated, delayed, or excessive reports. Do not execute real malware.
- Preserve original provenance through relays; repeated copies of one observation do not count as independent corroboration.
- Represent permissions and incident/time limits as simulator rules. Authorized-user misuse can be modeled as attempts to access or retain information outside the stated purpose. Passing these tests demonstrates the modeled policy only, not protection against a compromised host or real-world surveillance.
- Keep uncertainty and conflicting evidence visible. Missing reports do not prove absence of people.

### Deferred from this study

- Real Wi-Fi sensing, radio hardware, rubble detection validation, and collection of people's presence or movement data.
- Police/government integrations, operational rescue deployment, production identity systems, and real-world surveillance monitoring.
- Malware execution, sandbox escape testing, hardware isolation, secure firmware, and claims of resistance to administrator-level compromise.
- Mandatory photo/satellite training pipelines, coordinator fine-tuning, Android measurements, and elaborate explanatory visuals. Existing or later verified prediction traces may be inputs, but are not prerequisites for the initial synthetic study.

### Evidence limits

Report synthetic assumptions explicitly and sweep sensor error, network disruption, and compromised-device conditions. Do not infer real detection accuracy, hardware security, privacy guarantees, or field rescue performance from simulation results. Select exact sweep values, adversary capabilities, and statistical comparisons before final experiments; this revised scope is not yet a frozen protocol.

## Earlier broader roadmap — retained for reference

## Summary

Deliver P0–P3 as a verified simulator, two independent perception benchmarks, coordinator experiments, a complete viewer, reproducible study artifacts, and a venue-neutral manuscript.

Use SPEC.md and DESIGN.md as the behavioral contract. Preserve the Next.js/TypeScript engine and React/Phaser viewer. Baseline verified on 31 October: 13 tests pass; local GPU is an RTX 4070 Ti with 12,282 MiB VRAM. Type checking and the production build were not rerun during planning.

Exclude optional drone, Android hardware, scale, and model-splitting extensions. Dataset access requirements remain explicit gates; blocked experiments remain incomplete.

## Implementation sequence

### 1. Establish evidence and engine correctness

- Map every applicable TODO item to implementation, acceptance checks, and evidence. Update completion status only after those checks pass.
- Introduce schema-2 tasks, observations, jobs, messages, profiles, results, and run manifests. Keep truth exclusively in the independent evaluator.
- Implement integer-millisecond scheduling, stable ordering, isolated RNG streams, and frozen external traces. Preserve the specified boundary ordering: failures, receipts/completions, admission, deadlines.
- Replace global knowledge with immutable per-agent stores populated only by completed local work or received messages.
- Implement timed inference admission, memory reservations, compatibility checks, outages, and explicit incomplete outcomes.
- Implement encoded-byte transport, FIFO serialization, propagation, loss, acknowledgements, deduplication, and one deadline-bounded retransmission.
- Implement event-backed replay, historical snapshots, new run identity on reset, and immutable finalized artifacts.
- Implement independent metrics recomputation, including correctness, timeliness, failures, retries, bytes, latency, memory, and nullable energy with provenance.

### 2. Stabilize ownership and public interfaces

- Retain `/api/simulation/*` and legacy demo defaults through an explicit adapter. Legacy scripted outcomes must never appear as research success.
- Add explicit schema-2 creation, typed snapshots, run identity, command IDs, and event cursors.
- Use a persistent single-process server owner with serialized per-run commands. Tabs consume snapshots; they do not independently advance simulations.
- Make step paused-only; speed affects pacing only. Use 400 for invalid input, 404 for unknown runs, and 409 for conflicting operations.
- Historical reads reconstruct recorded state without changing the live run. Topology, metrics, and inspector data must share one snapshot time.
- Export atomic run directories containing manifests, events, metrics, prediction references, hashes, and terminal status. Mark interrupted output explicitly.

### 3. Build real perception and coordinator pipelines

- Implement creator-linked acquisition and validation for CrisisMMD and xBD. Record release terms, checksums, availability, corrupt files, duplicates, and split provenance. Pause dependent acquisition where account access or terms acceptance is required.
- Keep photo severity and satellite building assessment separate. Preserve official splits for comparability and report additional grouped holdouts independently.
- Implement a mobile photo classifier baseline and the official satellite baseline pipeline, including paired transforms and official scoring.
- Qualify checkpoint/runtime candidates before integration: verify license, immutable revision, preprocessing, local memory fit, output telemetry, and reproducible execution. Freeze the selected artifacts before pilot collection.
- Implement exact tokenizer/template admission, the existing 4,096-token policy, bounded outputs, typed termination, provisional streams, and independent validation. Permit one smaller regeneration within the original deadline and cumulative budget.
- Compare rule-based, pretrained, and fine-tuned coordinators with identical observable information and action constraints.
- Generate fine-tuning examples from training-only simulations and actual locally available histories. Exclude truth, future events, hidden remote state, and hindsight-selected successes.
- Separate training, validation, pilot, and final partitions by event/geography/source where available, plus scenario templates and seeds. Preserve example-to-run provenance.
- Record fine-tuning as policy imitation unless evidence supports a broader claim. Distinguish replay determinism from training variability.

### 4. Complete the viewer and Anatomy explainer

- Finish create, play, pause, step, speed, reset, selection, lenses, timeline, and return-to-live workflows.
- Replace fixed HUD values with snapshot telemetry. Show pending commands, meaningful errors, preserved state, and recovery actions; prevent duplicate commands.
- Preserve selection and configuration where valid. Make reset consequences explicit and distinguish live state from historical inspection.
- Verify keyboard navigation, focus, accessible status, contrast, mobile layout, reduced motion, and teardown.
- Add an Anatomy Figure alongside the simulator: a detailed dispatch bench where an inference press creates result tokens, a conveyor models transmission, and a deadline gate illustrates delivery outcomes.
- Build 40–80 purposeful parts. Drive motion and readouts from one deterministic fixture using the engine’s timing rules. Label it as an explanatory fixture.
- Verify dark/light themes, 390-pixel layout, keyboard interaction, reduced motion, geometry audits, line checks, and close-up captures.

### 5. Freeze experiments and produce the manuscript

- Implement `LOCAL_ONLY`, `DIRECT`, `FULL`, and `SELECTIVE` against identical workloads, predictions, and external traces.
- Separate perception evaluation, oracle-evidence coordination, predicted-evidence coordination, and complete-system experiments.
- Define inference adaptation as choosing between two qualified service/quality profiles using local queue, memory, and deadline feasibility. Freeze thresholds on validation data.
- Isolate inference adaptation and sharing adaptation through factorial contrasts.
- Pilot separately, then freeze datasets, artifacts, policies, thresholds, horizons, scene sampling, and statistical analysis. Start with 30 paired final seeds per condition; justify any revised count using pilot evidence before final collection.
- Treat paired runs as simulator replicates and scenes/events as data sampling units. Report both sources of uncertainty, failed runs, and paired confidence intervals.
- Generate figures and tables exclusively from saved artifacts. Update related work and unresolved novelty checks.
- Produce an anonymous, venue-neutral manuscript with bibliography, limitations, reproducibility appendix, and source links for every empirical claim. Do not submit it.

## Verification and delivery

- Use test-first development at consequential seams: scheduling boundaries, leakage, transport timing, memory admission, replay, output interruption, metrics, and idempotency.
- Run focused tests and type checks during implementation; run the complete suite and production build after integration.
- Exercise real HTTP cross-route behavior and two-tab ownership. Verify browser happy paths, recovery, reset, historical inspection, and reopening.
- Reproduce a small reference experiment from a fresh checkout using permissible fixtures; independently recompute its metrics.
- Use nonoverlapping worker ownership for engine, data/model pipelines, and viewer work. Keep integration with the lead; require independent review of substantial changes.
- Finish with code review, resolved findings, updated acceptance evidence, and commits on the current branch. Do not mark externally blocked tasks complete.

## Defaults and routing record

Use local compute only, keep large datasets/checkpoints outside tracked source, and obtain current library documentation through Context7 before library-specific implementation. Context7 was not exposed during planning; resolve tool availability before that work.

Maintain an append-only routing ledger during execution. Planning records were kept in chat because Plan Mode prohibited workspace writes.

| Role | Requested settings | Consultations | Tokens/cache | Verification |
| --- | --- | ---: | --- | --- |
| Lead | Current selection | — | Unavailable | Settings unverified |
| Router | gpt-6-luna / low | 1 | Unavailable | Recommendation reviewed |
| Advisor | gpt-6-astra / high | 1 | Unavailable | Leakage and statistical recommendations incorporated |
| Implementation workers | Not dispatched | 0 | Unavailable | Pending |
| Repairs | None | 0 | — | None |

The advisor’s changes are incorporated: observable-history-only fine-tuning, template-disjoint evaluation, explicit experimental units, and separate claims for imitation, perception, and coordination.
