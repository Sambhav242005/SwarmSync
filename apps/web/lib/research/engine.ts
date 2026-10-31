import type { ResearchConfig, EngineState, EngineEvent, Observation, DeliveryRecord, LinkConfig } from './engine.types';
export type * from './engine.types';

type Scheduled = { at: number; priority: number; seq: number; kind: string; id: string };
type Checkpoint = { time: number; state: EngineState };
const clone = <T>(value: T): T => structuredClone(value);
const edge = (from: string, to: string) => JSON.stringify([from, to]);
const observationKey = (o: Observation) => JSON.stringify([o.origin, o.id, o.revision]);
const integer = (n: number) => Number.isSafeInteger(n) && n >= 0;

/** A deterministic, single-owner simulator. Inputs and returned records are copied. */
export class ResearchEngine {
  private readonly config: ResearchConfig;
  private state: EngineState;
  private queue: Scheduled[] = [];
  private sequence = 0;
  private log: EngineEvent[] = [];
  private checkpoints: Checkpoint[] = [];
  private sent = new Set<string>();
  private deliveries: DeliveryRecord[] = [];

  constructor(config: ResearchConfig, runId: string) {
    this.config = clone(config);
    if (!runId) throw new Error('runId is required');
    this.validate();
    this.state = { runId, timeMs: 0, devices: {}, links: {}, jobs: {}, messages: {}, tasks: {}, bytesAttempted: 0, bytesReceived: 0, drops: 0 };
    for (const d of this.config.devices) this.state.devices[d.id] = { id: d.id, available: true, memoryBytes: d.memoryBytes, usedMemoryBytes: 0, peakMemoryBytes: 0, knowledge: [], inferenceQueue: [], activeInference: null, outboundQueue: [], activeTransmission: null };
    for (const l of this.config.links) this.state.links[edge(l.from, l.to)] = true;
    for (const task of this.config.tasks) {
      this.state.tasks[task.id] = { task: clone(task), outcome: 'pending' };
      this.schedule(task.arrivalMs, 2, 'arrival', task.id);
      this.schedule(task.deadlineMs, 3, 'deadline', task.id);
    }
    for (let i = 0; i < (this.config.changes ?? []).length; i++) this.schedule(this.config.changes![i].atMs, 0, 'change', String(i));
    this.checkpoints.push({ time: 0, state: clone(this.state) });
  }
  private validate() {
    const c = this.config;
    if (!['LOCAL_ONLY', 'DIRECT', 'FULL', 'SELECTIVE'].includes(c.policy)) throw new Error('invalid policy');
    if (!integer(c.horizonMs) || !integer(c.payloadBytes) || c.payloadBytes === 0 || !integer(c.controlBytes ?? 0)) throw new Error('invalid horizon or byte count');
    if (new Set(c.devices.map(d => d.id)).size !== c.devices.length || c.devices.some(d => !d.id || !integer(d.memoryBytes))) throw new Error('invalid devices');
    const devices = new Set(c.devices.map(d => d.id));
    if (new Set(c.tasks.map(t => t.id)).size !== c.tasks.length) throw new Error('duplicate task');
    for (const t of c.tasks) if (!t.id || !devices.has(t.source) || !devices.has(t.destination) || !integer(t.arrivalMs) || !integer(t.deadlineMs) || t.deadlineMs < t.arrivalMs) throw new Error('invalid task');
    if (new Set(c.inference.map(i => i.taskId)).size !== c.inference.length || c.inference.length !== c.tasks.length) throw new Error('one inference trace per task is required');
    for (const i of c.inference) {
      const t = c.tasks.find(t => t.id === i.taskId);
      if (!t || !integer(i.durationMs) || !integer(i.memoryBytes) || i.observation.taskId !== t.id || i.observation.sampleId !== t.sampleId || i.observation.origin !== t.source || !integer(i.observation.revision)) throw new Error('invalid inference trace');
    }
    const edges = new Set<string>();
    for (const l of c.links) { const k = edge(l.from, l.to); if (!devices.has(l.from) || !devices.has(l.to) || l.from === l.to || edges.has(k) || !Number.isFinite(l.bitsPerSecond) || l.bitsPerSecond <= 0 || !integer(l.propagationMs)) throw new Error('invalid link'); edges.add(k); }
    for (const x of c.changes ?? []) if (!integer(x.atMs) || (x.kind === 'device' ? !devices.has(x.id) : !edges.has(x.id))) throw new Error('invalid availability change');
  }
  private schedule(at: number, priority: number, kind: string, id: string) { this.queue.push({ at, priority, seq: this.sequence++, kind, id }); }
  private emit(type: string, payload: Record<string, unknown> = {}, source?: string, target?: string) {
    this.log.push({ schemaVersion: 2, runId: this.state.runId, eventId: `${this.state.runId}:${this.log.length + 1}`, timeMs: this.state.timeMs, type, source, target, payload: clone(payload) });
  }
  private link(from: string, to: string): LinkConfig | undefined { return this.config.links.find(l => l.from === from && l.to === to); }
  private activeLink(from: string, to: string) { return !!this.state.links[edge(from, to)] && this.state.devices[from].available && this.state.devices[to].available; }
  private admit(deviceId: string) {
    const d = this.state.devices[deviceId];
    if (!d.available || d.activeInference) return;
    while (d.inferenceQueue.length) {
      const id = d.inferenceQueue.shift()!; const job = this.state.jobs[id];
      const trace = this.config.inference.find(i => i.taskId === job.taskId)!;
      if (trace.memoryBytes > d.memoryBytes) { job.status = 'rejected'; this.emit('inference_rejected', { jobId: id, reason: 'memory' }, deviceId); continue; }
      job.status = 'running'; job.startedAtMs = this.state.timeMs; d.activeInference = id; d.usedMemoryBytes += trace.memoryBytes; d.peakMemoryBytes = Math.max(d.peakMemoryBytes, d.usedMemoryBytes);
      this.emit('inference_started', { jobId: id }, deviceId); this.schedule(this.state.timeMs + trace.durationMs, 1, 'inference_done', id); break;
    }
  }
  private transmit(deviceId: string) {
    const d = this.state.devices[deviceId];
    if (!d.available || d.activeTransmission) return;
    while (d.outboundQueue.length) {
      const id = d.outboundQueue.shift()!; const m = this.state.messages[id];
      if (!this.activeLink(m.from, m.to)) { this.drop(id, 'unavailable'); continue; }
      const l = this.link(m.from, m.to)!;
      m.status = 'transmitting'; m.startedAtMs = this.state.timeMs; d.activeTransmission = id; this.state.bytesAttempted += m.bytes;
      const serialization = Math.ceil(m.bytes * 8 * 1000 / l.bitsPerSecond);
      m.dueAtMs = this.state.timeMs + serialization + l.propagationMs;
      this.emit('transmission_started', { messageId: id, bytes: m.bytes, dueAtMs: m.dueAtMs }, m.from, m.to);
      this.schedule(this.state.timeMs + serialization, 1, 'serialized', id); break;
    }
  }
  private drop(id: string, reason: string) {
    const m = this.state.messages[id];
    if (m.status === 'dropped' || m.status === 'received') return;
    m.status = 'dropped'; this.state.drops++; this.emit('message_dropped', { messageId: id, reason }, m.from, m.to);
    const d = this.state.devices[m.from]; if (d.activeTransmission === id) d.activeTransmission = null;
  }
  private publish(deviceId: string, observation: Observation) {
    const d = this.state.devices[deviceId];
    if (d.knowledge.some(o => observationKey(o) === observationKey(observation))) { this.emit('observation_duplicate', { observationId: observation.id }, deviceId); return; }
    d.knowledge.push(clone(observation)); this.emit('observation_committed', { observation: clone(observation) }, deviceId);
    const task = this.state.tasks[observation.taskId];
    if (deviceId === task.task.destination) {
      const receivedAtMs = this.state.timeMs;
      this.deliveries.push({ taskId: task.task.id, destination: deviceId, receivedAtMs, observation: clone(observation) });
      if (task.deliveredAtMs === undefined) { task.deliveredAtMs = receivedAtMs; task.outcome = receivedAtMs <= task.task.deadlineMs ? 'on-time' : 'late'; }
      this.emit('result_delivered', { taskId: task.task.id, observation: clone(observation), receivedAtMs }, deviceId);
    }
    if (this.config.policy === 'LOCAL_ONLY') return;
    const candidates = this.config.links.filter(l => l.from === deviceId && (this.config.policy === 'FULL' || l.to === task.task.destination));
    for (const l of candidates) {
      const key = JSON.stringify([observationKey(observation), l.from, l.to]); if (this.sent.has(key)) continue;
      this.sent.add(key);
      const id = `m${Object.keys(this.state.messages).length + 1}`;
      this.state.messages[id] = { id, observation: clone(observation), from: l.from, to: l.to, bytes: this.config.payloadBytes + (this.config.controlBytes ?? 0), status: 'queued', queuedAtMs: this.state.timeMs };
      d.outboundQueue.push(id); this.emit('message_queued', { messageId: id }, l.from, l.to);
    }
    this.schedule(this.state.timeMs, 2, 'transmit', deviceId);
  }
  private process(event: Scheduled) {
    const now = this.state.timeMs;
    if (event.kind === 'change') {
      const c = this.config.changes![Number(event.id)];
      if (c.kind === 'device') {
        const d = this.state.devices[c.id]; d.available = c.available; this.emit('device_availability', { available: c.available }, c.id);
        if (!c.available && d.activeInference) { const job = this.state.jobs[d.activeInference]; const trace = this.config.inference.find(i => i.taskId === job.taskId)!; job.status = 'aborted'; d.usedMemoryBytes -= trace.memoryBytes; d.activeInference = null; this.emit('inference_aborted', { jobId: job.id }, c.id); }
        if (!c.available) for (const m of Object.values(this.state.messages)) if ((m.from === c.id || m.to === c.id) && (m.status === 'transmitting' || m.status === 'in-flight')) { this.drop(m.id, 'device unavailable'); this.schedule(now, 2, 'transmit', m.from); }
        if (c.available) { this.schedule(now, 2, 'admit', c.id); this.schedule(now, 2, 'transmit', c.id); }
      } else {
        this.state.links[c.id] = c.available; this.emit('link_availability', { id: c.id, available: c.available });
        if (!c.available) for (const m of Object.values(this.state.messages)) if (edge(m.from, m.to) === c.id && (m.status === 'transmitting' || m.status === 'in-flight')) { this.drop(m.id, 'link unavailable'); this.schedule(now, 2, 'transmit', m.from); }
      }
    } else if (event.kind === 'arrival') {
      const task = this.state.tasks[event.id].task; const id = `j:${task.id}`;
      this.state.jobs[id] = { id, taskId: task.id, device: task.source, status: 'queued', queuedAtMs: now }; this.state.devices[task.source].inferenceQueue.push(id);
      this.emit('task_arrived', { taskId: task.id }, task.source); this.schedule(now, 2, 'admit', task.source);
    } else if (event.kind === 'inference_done') {
      const job = this.state.jobs[event.id]; if (job.status !== 'running') return;
      const d = this.state.devices[job.device]; const trace = this.config.inference.find(i => i.taskId === job.taskId)!;
      job.status = 'completed'; job.completedAtMs = now; d.activeInference = null; d.usedMemoryBytes -= trace.memoryBytes;
      this.emit('inference_completed', { jobId: job.id }, job.device); this.publish(job.device, { ...clone(trace.observation), createdAtMs: now }); this.schedule(now, 2, 'admit', job.device);
    } else if (event.kind === 'serialized') {
      const m = this.state.messages[event.id]; if (m.status !== 'transmitting') return;
      m.status = 'in-flight'; this.state.devices[m.from].activeTransmission = null; this.emit('message_serialized', { messageId: m.id }, m.from, m.to);
      this.schedule(m.dueAtMs!, 1, 'receipt', m.id); this.schedule(now, 2, 'transmit', m.from);
    } else if (event.kind === 'receipt') {
      const m = this.state.messages[event.id]; if (m.status !== 'in-flight') return;
      const loss = this.config.losses?.some(x => x.from === m.from && x.to === m.to && x.observationId === m.observation.id && x.attempt === 1);
      if (!this.activeLink(m.from, m.to) || loss) { this.drop(m.id, loss ? 'trace loss' : 'unavailable'); return; }
      m.status = 'received'; m.receivedAtMs = now; this.state.bytesReceived += m.bytes; this.emit('message_received', { messageId: m.id, bytes: m.bytes }, m.from, m.to); this.publish(m.to, m.observation);
    } else if (event.kind === 'admit') { this.admit(event.id);
    } else if (event.kind === 'transmit') { this.transmit(event.id);
    } else if (event.kind === 'deadline') {
      const task = this.state.tasks[event.id]; if (task.deliveredAtMs === undefined) task.outcome = 'missing';
      this.emit('task_deadline', { taskId: event.id, outcome: task.outcome });
    }
  }
  advanceTo(timeMs: number): EngineState {
    if (!integer(timeMs) || timeMs < this.state.timeMs || timeMs > this.config.horizonMs) throw new Error('invalid horizon');
    for (;;) {
      this.queue.sort((a, b) => a.at - b.at || a.priority - b.priority || a.seq - b.seq);
      const next = this.queue[0]; if (!next || next.at > timeMs) break;
      this.queue.shift(); this.state.timeMs = next.at; this.process(next); this.checkpoints.push({ time: next.at, state: clone(this.state) });
    }
    this.state.timeMs = timeMs; return this.snapshot();
  }
  snapshot(): EngineState { return clone(this.state); }
  events(): EngineEvent[] { return clone(this.log); }
  delivered(): DeliveryRecord[] { return clone(this.deliveries); }
  /** Event checkpoints are immutable copies; querying history never advances the live run. */
  snapshotAt(timeMs: number): EngineState {
    if (!integer(timeMs) || timeMs > this.state.timeMs) throw new Error('time outside recorded history');
    let state = this.checkpoints[0].state;
    for (const checkpoint of this.checkpoints) { if (checkpoint.time > timeMs) break; state = checkpoint.state; }
    const result = clone(state); result.timeMs = timeMs; return result;
  }
  /** Reset creates a separate engine, leaving this run and its records unchanged. */
  reset(runId: string): ResearchEngine { if (runId === this.state.runId) throw new Error('reset requires a new runId'); return new ResearchEngine(this.config, runId); }
}
/** Link identifiers in availability traces are stable encoded endpoint pairs. */
export const researchLinkId = edge;


