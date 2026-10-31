import { describe, expect, it } from 'vitest';
import { ResearchEngine, researchLinkId, type ResearchConfig } from './engine';
const fixture = (): ResearchConfig => ({
 devices: [{ id: 'a', memoryBytes: 10 }, { id: 'b', memoryBytes: 10 }],
 tasks: [{ id: 't', sampleId: 's', namespace: 'presence', arrivalMs: 0, deadlineMs: 20, source: 'a', destination: 'b', outputContract: 'label' }],
 inference: [{ taskId: 't', durationMs: 5, memoryBytes: 4, observation: { id: 'o', origin: 'a', revision: 0, taskId: 't', sampleId: 's', label: 'present', uncertainty: 0.2 } }],
 links: [{ from: 'a', to: 'b', bitsPerSecond: 8000, propagationMs: 5 }], policy: 'DIRECT', payloadBytes: 10, horizonMs: 50,
});
describe('research engine', () => {
 it('charges serialization and propagation and accepts receipt exactly at deadline', () => {
  const e = new ResearchEngine(fixture(), 'run'); expect(e.advanceTo(19).devices.b.knowledge).toEqual([]); const s = e.advanceTo(20);
  expect(s.tasks.t.outcome).toBe('on-time'); expect(s.tasks.t.deliveredAtMs).toBe(20); expect(s.bytesAttempted).toBe(10); expect(s.bytesReceived).toBe(10);
  expect(e.events().findIndex(x => x.type === 'message_received')).toBeLessThan(e.events().findIndex(x => x.type === 'task_deadline'));
 });
 it('aborts inference when failure coincides with completion', () => {
  const c = fixture(); c.changes = [{ atMs: 5, kind: 'device', id: 'a', available: false }, { atMs: 6, kind: 'device', id: 'a', available: true }];
  const s = new ResearchEngine(c, 'run').advanceTo(50); expect(s.jobs['j:t'].status).toBe('aborted'); expect(s.tasks.t.outcome).toBe('missing'); expect(s.devices.a.usedMemoryBytes).toBe(0);
 });
 it('drops in-flight packets when link failure coincides with receipt', () => {
  const c = fixture(); c.changes = [{ atMs: 20, kind: 'link', id: researchLinkId('a', 'b'), available: false }];
  const s = new ResearchEngine(c, 'run').advanceTo(20); expect(s.tasks.t.outcome).toBe('missing'); expect(s.drops).toBe(1); expect(s.bytesReceived).toBe(0);
 });
 it('isolates local stores and copies inputs, snapshots and history', () => {
  const c = fixture(); const e = new ResearchEngine(c, 'run'); c.inference[0].observation.label = 'mutated';
  const before = e.advanceTo(5); expect(before.devices.b.knowledge).toEqual([]); before.devices.a.knowledge[0].label = 'changed';
  const after = e.advanceTo(20); expect(after.devices.b.knowledge[0].label).toBe('present');
  const history = e.snapshotAt(5); history.devices.a.knowledge[0].label = 'changed again'; expect(e.snapshot().devices.a.knowledge[0].label).toBe('present'); expect(e.snapshotAt(5).devices.b.knowledge).toEqual([]);
 });
 it('is invariant to step partitions and reset uses a new identity', () => {
  const a = new ResearchEngine(fixture(), 'same'); const b = new ResearchEngine(fixture(), 'same'); a.advanceTo(50); for (const n of [0, 1, 5, 10, 20, 50]) b.advanceTo(n);
  expect(a.snapshot()).toEqual(b.snapshot()); expect(a.events()).toEqual(b.events()); const reset = a.reset('new'); reset.advanceTo(50);
  expect(reset.snapshot().runId).toBe('new'); expect(a.snapshot().runId).toBe('same'); expect(reset.delivered()).toEqual(a.delivered());
 });
 it('rejects a job exceeding memory', () => {
  const c = fixture(); c.inference[0].memoryBytes = 11; const s = new ResearchEngine(c, 'run').advanceTo(50);
  expect(s.jobs['j:t'].status).toBe('rejected'); expect(s.tasks.t.outcome).toBe('missing'); expect(s.devices.a.peakMemoryBytes).toBe(0);
 });
});
