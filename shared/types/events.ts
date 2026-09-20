export type SimEvent = {
  event_id: string; sim_time: number; type: string;
  source?: string | null; target?: string | null;
  payload: Record<string, unknown>; causality: string[];
};
