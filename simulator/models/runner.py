"""Deterministic seeded inference cost model (headless, small)."""
import hashlib
import random

QUANT_FACTOR = {"FP32": 1.6, "FP16": 1.2, "INT8": 1.0, "INT4": 0.8}
THERMAL_FACTOR = {"normal": 1.0, "warm": 1.3, "hot": 1.8}


def _clamp(x, lo=0.0, hi=1.0):
    return max(lo, min(hi, x))


def run_inference(device, model, complexity, seed=0):
    """Return {latency_ms, memory_mb, energy_mwh, quality, confidence}."""
    rng = random.Random(seed + int(hashlib.sha256(model.get("model_id", "").encode()).hexdigest(),16) % 100000)
    q = QUANT_FACTOR.get(model.get("quantization", "INT8"), 1.0)
    t = THERMAL_FACTOR.get(device.get("thermal_state", "normal"), 1.0)
    batt = 1.2 if device.get("battery_percent", 100) < 20 else 1.0
    cap = (
        float(device.get("cpu_score", 0.5))
        + float(device.get("gpu_score", 0.0))
        + float(device.get("npu_score", 0.0))
    ) / 3
    base = float(model.get("base_latency_ms", 100))
    latency_ms = round(
        base * (1.2 - cap) * q * (1 + float(complexity)) * t * batt * (0.95 + rng.random() * 0.1), 2
    )
    quality = round(
        _clamp(
            float(model.get("quality_score", 0.5)) * cap * (1 - float(complexity) * 0.2)
            + (rng.random() - 0.5) * 0.05
        ),
        3,
    )
    memory_mb = float(model.get("memory_requirement_mb", 100))
    energy_mwh = round(float(model.get("energy_cost", 1.0)) * (latency_ms / 1000), 3)
    confidence = round(quality, 3)
    return {
        "latency_ms": latency_ms,
        "memory_mb": memory_mb,
        "energy_mwh": energy_mwh,
        "quality": quality,
        "confidence": confidence,
    }
