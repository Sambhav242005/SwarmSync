import type { Generated, GeneratorInput, Observation } from './types';

function integer(value: number, name: string, min = 0): void {
  if (!Number.isSafeInteger(value) || value < min) throw new Error(`Invalid ${name}`);
}
function rate(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error(`Invalid ${name}`);
}
function rng(seed: number): () => number {
  let x = seed >>> 0;
  return () => { x = (x + 0x6d2b79f5) >>> 0; let t = x; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function freeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
}
/** Generated trace is detached from inputs and frozen; retain evaluatorTruth only in evaluator storage. */
export function generateSynthetic(input: GeneratorInput): Generated {
  integer(input.seed, 'seed');
  const a = input.assumptions;
  rate(a.falsePositiveRate, 'falsePositiveRate'); rate(a.falseNegativeRate, 'falseNegativeRate'); rate(a.sharedErrorProbability, 'sharedErrorProbability');
  for (const range of [a.observationDelayMs, a.reportingDelayMs]) {
    integer(range[0], 'delay'); integer(range[1], 'delay'); if (range[0] > range[1]) throw new Error('Invalid delay range');
  }
  if (new Set(input.origins).size !== input.origins.length || input.origins.some(x => !x)) throw new Error('Invalid origins');
  const truth = new Map(input.truth.map(t => [t.taskId, t.label]));
  if (truth.size !== input.truth.length || input.tasks.length !== truth.size || new Set(input.tasks.map(t => t.id)).size !== input.tasks.length) throw new Error('Task/truth mismatch');
  const random = rng(input.seed);
  const delay = (range: readonly [number, number]) => range[0] + Math.floor(random() * (range[1] - range[0] + 1));
  const reports: Observation[] = [];
  for (const task of input.tasks) {
    integer(task.arrivalMs, 'arrival'); integer(task.deadlineMs, 'deadline');
    if (!task.id || !task.sampleId || !task.destination || task.deadlineMs < task.arrivalMs) throw new Error('Invalid task');
    const actual = truth.get(task.id);
    if (actual !== 'present' && actual !== 'absent') throw new Error('Missing truth');
    const shared = random() < a.sharedErrorProbability; const sharedDraw = random();
    for (const origin of input.origins) {
      const error = (shared ? sharedDraw : random()) < (actual === 'present' ? a.falseNegativeRate : a.falsePositiveRate);
      const observedAtMs = task.arrivalMs + delay(a.observationDelayMs);
      const id = `${task.id}:${origin}`;
      reports.push({ id, origin, revision: 0, taskId: task.id, sampleId: task.sampleId, label: error ? (actual === 'present' ? 'absent' : 'present') : actual, uncertainty: 0, observedAtMs, createdAtMs: observedAtMs + delay(a.reportingDelayMs), evidenceIds: [id] });
    }
  }
  if (new Set(reports.map(r => JSON.stringify([r.origin, r.id, r.revision]))).size !== reports.length) throw new Error('Generated provenance collision');
  for (const injection of input.injections) {
    if (injection.kind === 'false') {
      integer(injection.delayMs, 'injection delay');
      const task = input.tasks.find(t => t.id === injection.taskId); const actual = truth.get(injection.taskId);
      if (!task || !actual || !input.origins.includes(injection.origin)) throw new Error('Invalid false injection');
      const id = `false:${reports.length}:${task.id}:${injection.origin}`;
      reports.push({ id, origin: injection.origin, revision: 0, taskId: task.id, sampleId: task.sampleId, label: actual === 'present' ? 'absent' : 'present', uncertainty: 0, observedAtMs: task.arrivalMs, createdAtMs: task.arrivalMs + injection.delayMs, evidenceIds: [id] });
      continue;
    }
    const index = reports.findIndex(r => r.id === injection.observationId);
    if (index < 0) throw new Error('Unknown injected observation');
    const original = reports[index];
    if (injection.kind === 'delay') {
      integer(injection.delayMs, 'injection delay'); reports[index] = { ...original, createdAtMs: original.createdAtMs + injection.delayMs };
    } else if (injection.kind === 'excessive') {
      integer(injection.count, 'count'); integer(injection.intervalMs, 'interval');
      for (let n = 1; n <= injection.count; n++) reports.push({ ...original, createdAtMs: original.createdAtMs + n * injection.intervalMs });
    } else {
      integer(injection.delayMs, 'injection delay'); reports.push({ ...original, createdAtMs: original.createdAtMs + injection.delayMs });
    }
  }
  reports.sort((a, b) => a.createdAtMs - b.createdAtMs || a.id.localeCompare(b.id));
  const publicTrace = { version: 'synthetic-observations-v1' as const, seed: input.seed, assumptions: { ...a, observationDelayMs: [...a.observationDelayMs] as [number, number], reportingDelayMs: [...a.reportingDelayMs] as [number, number] }, tasks: input.tasks.map(t => ({ ...t })), reports };
  return freeze({ publicTrace, evaluatorTruth: input.truth.map(t => ({ ...t })) });
}

