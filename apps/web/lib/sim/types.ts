export type SimEvent = {
  event_id: string;
  sim_time: number;
  type: string;
  source?: string | null;
  target?: string | null;
  payload: Record<string, unknown>;
  causality: string[];
};
export type Topology = {
  devices: { id: string; x: number; y: number; tier: string; battery: number; failed: boolean; ram_gb: number }[];
  agents: { id: string; device: string; role: string; state: string }[];
  pois: { poi_id: string; kind: string; x: number; y: number }[];
};
