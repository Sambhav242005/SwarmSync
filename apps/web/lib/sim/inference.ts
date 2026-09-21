import { createHash } from "node:crypto";
import { mulberry32 } from "./rng";
const QF: Record<string, number> = { FP32: 1.6, FP16: 1.2, INT8: 1.0, INT4: 0.8 };
const TF: Record<string, number> = { normal: 1.0, warm: 1.3, hot: 1.8 };
export function runInference(device: { cpu_score: number; gpu_score: number; npu_score: number; thermal_state?: string; battery_percent?: number }, model: { model_id: string; quantization?: string; base_latency_ms?: number; quality_score?: number; memory_requirement_mb?: number; energy_cost?: number }, complexity: number, seed = 0): { latency_ms: number; memory_mb: number; energy_mwh: number; quality: number; confidence: number } {
  const h = parseInt(createHash("sha256").update(model.model_id).digest("hex").slice(0, 8), 16) % 100000;
  const rng = mulberry32(seed + h);
  const q = QF[model.quantization ?? "INT8"] ?? 1; const t = TF[device.thermal_state ?? "normal"] ?? 1;
  const batt = (device.battery_percent ?? 100) < 20 ? 1.2 : 1;
  const cap = (device.cpu_score + device.gpu_score + device.npu_score) / 3;
  const base = model.base_latency_ms ?? 100;
  const latency_ms = Math.round(base * (1.2 - cap) * q * (1 + complexity) * t * batt * (0.95 + rng() * 0.1) * 100) / 100;
  const quality = Math.round(Math.min(1, Math.max(0, (model.quality_score ?? 0.5) * cap * (1 - complexity * 0.2) + (rng() - 0.5) * 0.05)) * 1000) / 1000;
  const energy_mwh = Math.round((model.energy_cost ?? 1) * (latency_ms / 1000) * 1000) / 1000;
  return { latency_ms, memory_mb: model.memory_requirement_mb ?? 100, energy_mwh, quality, confidence: quality };
}
