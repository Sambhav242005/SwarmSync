export type SharingPolicy = 'LOCAL_ONLY' | 'DIRECT' | 'FULL' | 'SELECTIVE';
export interface ResearchTask {
  id: string; sampleId: string; namespace: string; arrivalMs: number; deadlineMs: number;
  source: string; destination: string; outputContract: string;
}
export interface Observation {
  id: string; origin: string; revision: number; taskId: string; sampleId: string;
  label: string; uncertainty: number; createdAtMs: number; observedAtMs?: number; evidenceIds?: string[];
}
export interface DeviceConfig { id: string; memoryBytes: number }
/** Fixed predictions and service times are external inputs, never evaluator labels. */
export interface InferenceTrace { taskId: string; durationMs: number; memoryBytes: number; observation: Omit<Observation, 'createdAtMs'> }
export interface LinkConfig { from: string; to: string; bitsPerSecond: number; propagationMs: number }
export interface AvailabilityChange { atMs: number; kind: 'device' | 'link'; id: string; available: boolean }
export interface LossTrace { from: string; to: string; attempt: number; observationId: string }
export interface ResearchConfig {
  devices: DeviceConfig[]; tasks: ResearchTask[]; inference: InferenceTrace[]; links: LinkConfig[];
  changes?: AvailabilityChange[]; losses?: LossTrace[]; policy: SharingPolicy; payloadBytes: number;
  controlBytes?: number; horizonMs: number;
}
export interface DeviceState { id: string; available: boolean; memoryBytes: number; usedMemoryBytes: number; peakMemoryBytes: number; knowledge: Observation[]; inferenceQueue: string[]; activeInference: string | null; outboundQueue: string[]; activeTransmission: string | null }
export type JobStatus = 'queued' | 'running' | 'completed' | 'aborted' | 'rejected';
export interface JobState { id: string; taskId: string; device: string; status: JobStatus; queuedAtMs: number; startedAtMs?: number; completedAtMs?: number }
export type MessageStatus = 'queued' | 'transmitting' | 'in-flight' | 'received' | 'dropped';
export interface MessageState { id: string; observation: Observation; from: string; to: string; bytes: number; status: MessageStatus; queuedAtMs: number; startedAtMs?: number; dueAtMs?: number; receivedAtMs?: number }
export interface TaskState { task: ResearchTask; outcome: 'pending' | 'on-time' | 'late' | 'missing'; deliveredAtMs?: number }
export interface EngineState { runId: string; timeMs: number; devices: Record<string, DeviceState>; links: Record<string, boolean>; jobs: Record<string, JobState>; messages: Record<string, MessageState>; tasks: Record<string, TaskState>; bytesAttempted: number; bytesReceived: number; drops: number }
export interface EngineEvent { schemaVersion: 2; runId: string; eventId: string; timeMs: number; type: string; source?: string; target?: string; payload: Record<string, unknown> }
export interface DeliveryRecord { taskId: string; destination: string; receivedAtMs: number; observation: Observation }

