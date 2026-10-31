# Research experiments

Updated: 31 October 2026. Proposed protocol, not completed benchmark evidence. See [current scope](RESEARCH-COMPLETION-PLAN.md#current-scope--research-paper-and-simulator-only), [requirements](SPEC.md), [design](DESIGN.md) and [acceptance checklist](TODO.md).

## Initial synthetic study

Start with six devices and generated sensor reports. Compare LOCAL_ONLY, DIRECT, FULL and SELECTIVE sharing using identical workloads, observation inputs and external network/failure traces, with declared scheduling baselines. The evaluator alone sees truth.

Declare false-positive, false-negative, timing and correlation assumptions. Sweep sensor error, network disruption and compromised-device conditions. Inject false, replayed, duplicated, delayed and excessive reports without real malware. Preserve origin provenance and distinguish independent evidence from repeated copies. Keep uncertainty and conflicting reports visible.

Test permissions and incident/time limits as modeled rules. These tests do not establish protection against a compromised host, privacy guarantees or operational suitability.

## Collection protocol

- Complete P0, SYN and essential viewer gates before final collection.
- Pilot separately, then freeze generator versions, parameter ranges, adversary capabilities, policy thresholds, scheduling, horizons and statistical comparisons.
- Use paired seeds across policies. Thirty paired final seeds per condition is a provisional starting point; justify and freeze the count using pilot evidence before final collection.
- Define experimental units and report paired uncertainty intervals, failed/interrupted runs and sensitivity to synthetic assumptions.
- Measure correct on-time delivery, false reports, missed results, latency and communication cost. Unknown energy is unavailable, not zero.
- Save configuration/profile hashes, code revision, seeds, events, metrics and terminal status. Independently recompute metrics and generate every figure/table from saved artifacts.
- Reproduce a small reference experiment from a fresh checkout. Produce a venue-neutral manuscript with bibliography, limitations and reproducibility appendix; do not submit it.

Current sessions are in memory; batch collection and persistent exports remain pending. The exact protocol is not yet frozen.

## Deferred extensions and supporting references

External photo/satellite datasets, model training, language-coordinator fine-tuning and Android measurements are optional future studies, not prerequisites. Dated [dataset notes](dataset-options.md), [literature review](literature-review-on-device-vision.md), [budget design](benchmark-and-budget-design.md) and [Android research](android-gpu-capacity-research.md) remain reference material. Simulation outcomes do not establish real detection accuracy, hardware security or field rescue performance.
