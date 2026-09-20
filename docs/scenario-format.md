# Scenario format

> Device/model numbers are **simulated estimates, NOT real Android hardware measurements**.

## `data/scenarios/earthquake-6.json`

```json
{
  "scenario_id": "earthquake_response",
  "devices": ["android_01" ... "android_06"],
  "agents": [{"id": "agent_a", "role": "vision_ocr"}, ... {"id": "agent_f", "role": "coordinator"}],
  "network": {"mode": "intermittent", "bandwidth_kbps": 800, "latency_ms": 120, "packet_loss": 0.15, "range_m": 30},
  "failures": [{"device": "android_04", "at": 60, "for": 20}]
}
```

- `scenario_id`: string key. `devices`: 6 unit ids rendered by Phaser world. `agents`: id + role (`vision_ocr, vision, small_llm, ocr_reasoning, embedding_validator, coordinator`).
- `network`: `mode` (intermittent), `bandwidth_kbps`, `latency_ms`, `packet_loss`, `range_m` (feeds `link_up` range gate, default 30).
- `failures`: list of `{device, at (sim s), for (duration s)}` injection windows.

## Device profiles (`data/device-profiles/android-tiers.json`)

- Array of `{profile_id, ram_gb, cpu_score, gpu_score, npu_score, battery_mah}`; tiers: `high_end (12GB, .92/.94/.9)`, `upper_mid (8GB, .71/.83/.77)`, `mid (6GB, .55/.6/.5)`, `low_end (4GB, .35/.38/.2)`. Scores feed `cap` in `run_inference`; `battery_percent`/`thermal_state` supplied at runtime (defaults 100/normal).

## Model profiles (`data/model-profiles/models.json`)

- Array of `{model_id, name, model_type, quantization, model_size_mb, memory_requirement_mb, base_latency_ms, quality_score, energy_cost, thermal_cost, supported_tasks[], supported_runtimes[]}`. Slice ships `ocr_int8` (OCR, 210ms base, q .84) and `det_int8` (detect, 260ms base, q .82), both INT8 / nnapi-capable.
