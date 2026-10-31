/** Standalone schema: no engine or policy imports. Times are integer milliseconds. */
export type Label = 'present' | 'absent' | 'uncertain';
export interface Task { id: string; sampleId: string; arrivalMs: number; deadlineMs: number; destination: string }
export interface Truth { taskId: string; label: 'present' | 'absent' }
export interface Observation {
  id: string; origin: string; revision: number; taskId: string; sampleId: string;
  label: Label; uncertainty: number; observedAtMs: number; createdAtMs: number; evidenceIds: readonly string[];
}
export interface Delivery { taskId: string; destination: string; receivedAtMs: number; observation: Observation }
export interface Traffic { kind: 'payload' | 'control' | 'ack'; status: 'attempted' | 'received' | 'dropped'; bytes: number; retry: boolean }
export interface Assumptions {
  falsePositiveRate: number; falseNegativeRate: number;
  /** Chance per task of sharing one error draw across origins; otherwise draws are independent. */
  sharedErrorProbability: number;
  /** Uniform inclusive delays, after task arrival and observation respectively. */
  observationDelayMs: readonly [number, number]; reportingDelayMs: readonly [number, number];
}
export type Injection =
  | { kind: 'false'; taskId: string; origin: string; delayMs: number }
  | { kind: 'duplicate' | 'replay'; observationId: string; delayMs: number }
  | { kind: 'delay'; observationId: string; delayMs: number }
  | { kind: 'excessive'; observationId: string; count: number; intervalMs: number };
export interface GeneratorInput { seed: number; tasks: readonly Task[]; truth: readonly Truth[]; origins: readonly string[]; assumptions: Assumptions; injections: readonly Injection[] }
export interface PublicTrace { version: 'synthetic-observations-v1'; seed: number; assumptions: Assumptions; tasks: readonly Task[]; reports: readonly Observation[] }
export interface Generated { publicTrace: PublicTrace; evaluatorTruth: readonly Truth[] }
