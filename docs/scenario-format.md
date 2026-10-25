# Scenario and profile formats

Updated: 25 October 2026. Current demo data is described here. [DESIGN.md](../DESIGN.md#records-and-schema-version) defines future schema-2 records. Current device/model values are synthetic.

## Current scenario

`apps/web/data/earthquake-6.json` contains `earthquake_response`, six devices, six role-bearing agents, six POIs, network settings and an `android_04` failure at 60 s for 20 s. `Engine.fromScenario()` loads this bundled fixture; the API accepts only its scenario ID.

Roles cover vision/OCR, vision, language, OCR/reasoning, validation and coordination. Positions/tier choices and several task behaviors are derived/hardcoded in `SwarmWorld`; general agent/device counts are not validated. POIs are demonstration inputs, not dataset truth.

Mode/range and failures affect links. Bandwidth, latency and packet loss are present but do not implement delivery timing/loss.

## Current profiles

`apps/web/data/android-tiers.json` has high/upper-mid/mid/low tiers with 12/8/6/4 GB RAM, normalized CPU/GPU/NPU scores and battery capacity. These are not measurements, population averages or application RAM grants.

`apps/web/data/models.json` has OCR, detector, small LLM, embedder and reasoner profiles. Fields cover quantization, size/memory, base latency, quality, energy/thermal cost, tasks and runtime names. No checkpoint/tokenizer/conversion/Android backend is bound to them. `nnapi`/`gpu` strings prove neither accelerator availability nor native integer precision.

Research profiles add artifact/provenance hashes, task/input shape, compatibility and timing/resource samples. Generative profiles also need documented/effective context and output budgets. Keep synthetic, paper-derived and measured records distinct; do not silently promote legacy fixtures on migration.
