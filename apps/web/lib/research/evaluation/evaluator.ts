import type { Delivery, Observation, PublicTrace, Traffic, Truth } from './types';

const key = (o: Observation) => JSON.stringify([o.origin, o.id, o.revision]);
const content = (o: Observation) => JSON.stringify([o.taskId, o.sampleId, o.label, o.uncertainty, o.observedAtMs, o.evidenceIds]);
function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(p * sorted.length) - 1];
}
/** Recompute from public trace, private truth and received deliveries. No engine state is consulted. */
export function evaluate(trace: PublicTrace, truth: readonly Truth[], deliveries: readonly Delivery[], traffic: readonly Traffic[], horizonMs: number) {
  if (!Number.isSafeInteger(horizonMs) || horizonMs <= 0) throw new Error('Invalid horizon');
  const tasks = new Map(trace.tasks.map(t => [t.id, t]));
  const labels = new Map(truth.map(t => [t.taskId, t.label]));
  if (truth.some(t => t.label !== 'present' && t.label !== 'absent') || tasks.size !== trace.tasks.length || labels.size !== truth.length || labels.size !== tasks.size || [...tasks.keys()].some(id => !labels.has(id))) throw new Error('Task/truth mismatch');
  const reports = new Map<string, Observation>();
  for (const report of trace.reports) {
    const task = tasks.get(report.taskId);
    if (!task || report.sampleId !== task.sampleId || !report.id || !report.origin || !Number.isSafeInteger(report.revision) || report.revision < 0 || !Number.isSafeInteger(report.createdAtMs) || !Number.isSafeInteger(report.observedAtMs) || report.observedAtMs < task.arrivalMs || report.createdAtMs < report.observedAtMs || !['present', 'absent', 'uncertain'].includes(report.label) || !Number.isFinite(report.uncertainty) || report.uncertainty < 0 || report.uncertainty > 1) throw new Error('Invalid report');
    const previous = reports.get(key(report));
    if (previous && content(previous) !== content(report)) throw new Error('Conflicting provenance');
    if (!previous || report.createdAtMs < previous.createdAtMs) reports.set(key(report), report);
  }
  let falseReports = 0; let definiteReports = 0;
  for (const report of reports.values()) if (report.label !== 'uncertain') { definiteReports++; if (labels.get(report.taskId) !== report.label) falseReports++; }
  const byTask = new Map<string, Delivery[]>();
  let invalidDeliveries = 0; let wrongDestination = 0; let duplicateDeliveries = 0;
  const seen = new Set<string>();
  for (const delivery of deliveries) {
    const task = tasks.get(delivery.taskId); const report = delivery.observation;
    const canonical = reports.get(key(report));
    if (!task || report.taskId !== delivery.taskId || !canonical || content(canonical) !== content(report) || !Number.isSafeInteger(delivery.receivedAtMs) || delivery.receivedAtMs < report.createdAtMs || delivery.receivedAtMs > horizonMs || !trace.reports.some(r => key(r) === key(report) && r.createdAtMs === report.createdAtMs && content(r) === content(report))) { invalidDeliveries++; continue; }
    if (delivery.destination !== task.destination) { wrongDestination++; continue; }
    const identity = JSON.stringify([delivery.taskId, delivery.destination, key(report)]);
    if (seen.has(identity)) duplicateDeliveries++; else seen.add(identity);
    const list = byTask.get(task.id) ?? []; list.push(delivery); byTask.set(task.id, list);
  }
  let delivered = 0, correctOnTime = 0, wrong = 0, late = 0, uncertain = 0, absent = 0, conflictingEvidence = 0;
  const latencies: number[] = [];
  const outcomes = trace.tasks.map(task => {
    const copies = (byTask.get(task.id) ?? []).sort((a, b) => a.receivedAtMs - b.receivedAtMs);
    const unique = new Map<string, Delivery>();
    for (const copy of copies) if (!unique.has(key(copy.observation))) unique.set(key(copy.observation), copy);
    const evidence = [...unique.values()];
    const definite = new Set(evidence.map(d => d.observation.label).filter(label => label !== 'uncertain'));
    const evidenceState = evidence.length === 0 ? 'absent' : definite.size > 1 ? 'conflicting' : definite.size === 0 ? 'uncertain' : 'consistent';
    if (evidenceState === 'absent') absent++;
    if (evidenceState === 'conflicting') conflictingEvidence++;
    if (evidence.length) delivered++;
    const correct = evidence.find(d => d.observation.label === labels.get(task.id) && d.receivedAtMs <= task.deadlineMs);
    if (correct) { correctOnTime++; latencies.push(correct.receivedAtMs - task.arrivalMs); }
    if (evidence.some(d => d.observation.label !== 'uncertain' && d.observation.label !== labels.get(task.id))) wrong++;
    if (copies.some(d => d.receivedAtMs > task.deadlineMs)) late++;
    if (evidence.some(d => d.observation.label === 'uncertain')) uncertain++;
    return { taskId: task.id, evidenceState, distinctEvidenceProvenance: evidence.length, delivered: evidence.length > 0, correctOnTime: !!correct, latencyMs: correct ? correct.receivedAtMs - task.arrivalMs : null };
  });
  const bytes = { attempted: 0, received: 0, dropped: 0, retryAttempted: 0, payloadAttempted: 0, controlAttempted: 0, ackAttempted: 0 };
  for (const item of traffic) {
    if (!Number.isSafeInteger(item.bytes) || item.bytes < 0 || !['attempted', 'received', 'dropped'].includes(item.status) || !['payload', 'control', 'ack'].includes(item.kind)) throw new Error('Invalid traffic');
    bytes[item.status] += item.bytes;
    if (item.status === 'attempted') { if (item.retry) bytes.retryAttempted += item.bytes; bytes[`${item.kind}Attempted`] += item.bytes; }
  }
  return {
    provenance: { generatorVersion: trace.version, seed: trace.seed, horizonMs, throughputDenominator: 'full configured horizon seconds', taskDenominator: 'all configured tasks', falseReportDenominator: 'unique definite report provenance', latencyPopulation: 'first correct on-time receipt per task; arrival to receipt', percentileMethod: 'nearest rank', byteAccounting: 'sum of supplied traffic records by status; attempted includes retries and duplicates' },
    tasks: { total: tasks.size, delivered, correctOnTime, missedCorrectOnTime: tasks.size - correctOnTime, wrong, late, uncertain, absent, conflictingEvidence },
    reports: { unique: reports.size, definite: definiteReports, false: falseReports, falseFraction: definiteReports ? falseReports / definiteReports : null },
    deliveries: { invalid: invalidDeliveries, wrongDestination, duplicates: duplicateDeliveries },
    usefulThroughputPerSecond: correctOnTime / (horizonMs / 1000), latencyMs: { p50: percentile(latencies, 0.5), p95: percentile(latencies, 0.95), count: latencies.length }, bytes, outcomes,
  };
}



