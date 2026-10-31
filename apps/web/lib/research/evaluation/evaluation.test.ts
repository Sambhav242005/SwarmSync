import { describe, expect, it } from 'vitest';
import { evaluate, generateSynthetic } from './index';
import type { Delivery, GeneratorInput, Observation } from './index';
const input: GeneratorInput = {
  seed: 42, tasks: ['a','b','c'].map(id => ({ id, sampleId: `s${id}`, arrivalMs: 0, deadlineMs: 100, destination: 'base' })),
  truth: [{ taskId: 'a', label: 'present' }, { taskId: 'b', label: 'absent' }, { taskId: 'c', label: 'present' }], origins: ['one','two'],
  assumptions: { falsePositiveRate: 0, falseNegativeRate: 0, sharedErrorProbability: 1, observationDelayMs: [10,10], reportingDelayMs: [5,5] }, injections: [],
};
describe('synthetic generation', () => {
  it('is deterministic, detached, frozen and separates truth', () => {
    const g = generateSynthetic(input);
    expect(g).toEqual(generateSynthetic(input));
    expect(g.publicTrace.reports[0]).toMatchObject({ id: 'a:one', observedAtMs: 10, createdAtMs: 15, label: 'present' });
    expect(JSON.stringify(g.publicTrace)).not.toContain('evaluatorTruth');
    expect(Object.isFrozen(g.publicTrace.reports[0].evidenceIds)).toBe(true);
    expect(g.publicTrace.tasks[0]).not.toBe(input.tasks[0]);
  });
  it('models error rates and injected copies retaining provenance', () => {
    const g = generateSynthetic({ ...input, assumptions: { ...input.assumptions, falsePositiveRate: 1, falseNegativeRate: 1 }, injections: [
      { kind: 'false', taskId: 'a', origin: 'one', delayMs: 2 }, { kind: 'delay', observationId: 'a:one', delayMs: 5 },
      { kind: 'duplicate', observationId: 'a:one', delayMs: 1 }, { kind: 'replay', observationId: 'a:one', delayMs: 2 },
      { kind: 'excessive', observationId: 'a:one', count: 2, intervalMs: 3 },
    ] });
    expect(g.publicTrace.reports.find(r => r.id === 'b:one')?.label).toBe('present');
    expect(g.publicTrace.reports.find(r => r.id === 'a:two')?.label).toBe('absent');
    const copies = g.publicTrace.reports.filter(r => r.id === 'a:one');
    expect(copies.map(r => r.createdAtMs)).toEqual([20,21,22,23,26]);
    expect(copies.every(r => r.origin === 'one' && r.revision === 0)).toBe(true);
    expect(() => generateSynthetic({ ...input, assumptions: { ...input.assumptions, falsePositiveRate: 2 } })).toThrow();
  });
});
describe('independent evaluator', () => {
  it('computes hand-labeled outcomes, deduplication, timings and traffic', () => {
    const g = generateSynthetic({ ...input, injections: [{ kind: 'false', taskId: 'a', origin: 'two', delayMs: 1 }, { kind: 'replay', observationId: 'a:one', delayMs: 50 }] });
    const report = (id: string, at?: number) => g.publicTrace.reports.find(r => r.id === id && (at === undefined || r.createdAtMs === at))!;
    const delivery = (o: Observation, receivedAtMs: number, destination = 'base'): Delivery => ({ taskId: o.taskId, destination, receivedAtMs, observation: o });
    const falseReport = g.publicTrace.reports.find(r => r.id.startsWith('false:'))!;
    const result = evaluate(g.publicTrace, g.evaluatorTruth, [delivery(falseReport,20), delivery(report('a:one'),100), delivery(report('a:one',65),110), delivery(report('b:one'),101), delivery(report('c:one'),30,'wrong')], [
      { kind: 'payload', status: 'attempted', bytes: 100, retry: false }, { kind: 'payload', status: 'attempted', bytes: 100, retry: true },
      { kind: 'control', status: 'attempted', bytes: 5, retry: false }, { kind: 'ack', status: 'attempted', bytes: 3, retry: false },
      { kind: 'payload', status: 'dropped', bytes: 100, retry: false }, { kind: 'payload', status: 'received', bytes: 100, retry: true },
    ], 1000);
    expect(result.tasks).toEqual({ total: 3, delivered: 2, correctOnTime: 1, missedCorrectOnTime: 2, wrong: 1, late: 2, uncertain: 0, absent: 1, conflictingEvidence: 1 });
    expect(result.reports).toEqual({ unique: 7, definite: 7, false: 1, falseFraction: 1 / 7 });
    expect(result.deliveries).toEqual({ invalid: 0, wrongDestination: 1, duplicates: 1 });
    expect(result.outcomes[0]).toMatchObject({ distinctEvidenceProvenance: 2, evidenceState: 'conflicting', latencyMs: 100 });
    expect(result.usefulThroughputPerSecond).toBe(1); expect(result.latencyMs).toEqual({ p50: 100, p95: 100, count: 1 });
    expect(result.bytes).toEqual({ attempted: 208, received: 100, dropped: 100, retryAttempted: 100, payloadAttempted: 200, controlAttempted: 5, ackAttempted: 3 });
  });
  it('rejects forged deliveries and conflicting provenance; absence is unknown', () => {
    const g = generateSynthetic(input); const o = g.publicTrace.reports[0]; const forged = { ...o, label: 'absent' as const };
    const r = evaluate(g.publicTrace, g.evaluatorTruth, [{ taskId: o.taskId, destination: 'base', receivedAtMs: 20, observation: forged }], [], 1000);
    expect(r.deliveries.invalid).toBe(1); expect(r.outcomes[0].evidenceState).toBe('absent'); expect(r.latencyMs.p50).toBeNull();
    expect(() => evaluate({ ...g.publicTrace, reports: [...g.publicTrace.reports, forged] }, g.evaluatorTruth, [], [], 1000)).toThrow('Conflicting provenance');
  });
});

describe('uncertain evidence', () => {
  it('does not turn abstention into a positive, negative, or successful result', () => {
    const g = generateSynthetic(input);
    const o = { ...g.publicTrace.reports[0], label: 'uncertain' as const, uncertainty: 1 };
    const trace = { ...g.publicTrace, reports: [o] };
    const result = evaluate(trace, g.evaluatorTruth, [{ taskId: o.taskId, destination: 'base', receivedAtMs: 20, observation: o }], [], 1000);
    expect(result.outcomes[0]).toMatchObject({ evidenceState: 'uncertain', delivered: true, correctOnTime: false });
    expect(result.tasks).toMatchObject({ uncertain: 1, absent: 2, missedCorrectOnTime: 3 });
    expect(result.reports.falseFraction).toBeNull();
  });
});

