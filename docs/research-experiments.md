# Research experiments

Updated: 25 October 2026. This is an experiment entry point, not completed benchmark evidence. Requirements, decisions and execution order are [SPEC.md](../SPEC.md), [DESIGN.md](../DESIGN.md) and [TODO.md](../TODO.md).

## Initial study

Start with six devices and separate CrisisMMD photograph/xBD satellite tracks; add drone segmentation later. Freeze held-out predictions and external network/failure traces, then compare direct delivery, full sharing and selective sharing. Local-only/no-network is diagnostic. Include a direct-delivery comparator so beating flooding is not the only evidence.

Begin with fixed local inference. Add adaptation and language coordination with separate ablations and a rule-based baseline. Literature speedups and synthetic profiles are not measurements.

## Collection protocol

- Complete P0 correctness gates and selected dataset/model integration before final collection.
- Pin splits, artifacts/conversions/tokenizers/runtimes, service-time/resource profiles, policies and scoring.
- Use separate pilot seeds; start with 30 paired final seeds per condition and freeze count/protocol after uncertainty assessment.
- Report useful on-time throughput, task quality, bytes, latency/freshness, memory and incomplete/failed outcomes; label energy provenance and keep modality scores separate.
- Save config/data/profile hashes, revision, seeds, events, metrics and stop reason. Independently recompute plotted values and retain failed runs.

Current sessions are in memory. The Python SQLite store was removed; batch collection and persistent exports remain pending.

## Supporting evidence

- [Literature review](literature-review-on-device-vision.md) and [BibTeX](literature-review-on-device-vision.bib).
- [Datasets, splits and terms](dataset-options.md).
- [Budget/benchmark design](benchmark-and-budget-design.md).
- [Android support/capacity](android-gpu-capacity-research.md).

No current experiment establishes real Android FPS/energy, calibrated hazard probability or structural safety. Hardware conclusions require measurements; simulation claims must disclose assumptions.
