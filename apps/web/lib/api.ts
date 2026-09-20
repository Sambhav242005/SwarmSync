import type { SimEvent } from "../../../shared/types/events";

const BASE =
  process.env.NEXT_PUBLIC_SIM_URL ?? "http://localhost:8000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} failed: ${r.status}`);
  return r.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`);
  return r.json() as Promise<T>;
}

export async function createSimulation(seed = 0): Promise<{simulation_id: string}> {
  return post("/simulation/create", {seed});
}

export async function startSimulation(simulation_id: string): Promise<{ok: boolean}> {
  return post("/simulation/start", {simulation_id});
}

export async function pauseSimulation(simulation_id: string): Promise<{ok: boolean}> {
  return post("/simulation/pause", {simulation_id});
}

export async function stepSimulation(
  simulation_id: string, dt = 0.5
): Promise<{sim_time: number; events: SimEvent[]}> {
  return post("/simulation/step", {simulation_id, dt});
}

export async function resetSimulation(
  simulation_id: string, seed?: number
): Promise<{ok: boolean}> {
  return post("/simulation/reset", {simulation_id, seed});
}

export async function getState(
  simulation_id: string
): Promise<{sim_time: number; events: SimEvent[]}> {
  return get(`/simulation/state?simulation_id=${encodeURIComponent(simulation_id)}`);
}

export async function getEvents(simulation_id: string): Promise<SimEvent[]> {
  return get(`/simulation/${encodeURIComponent(simulation_id)}/events`);
}

export async function getMetrics(
  simulation_id: string
): Promise<Record<string, number>> {
  return get(`/simulation/${encodeURIComponent(simulation_id)}/metrics`);
}

export function connectSimulationWs(
  simulation_id: string,
  onMessage: (msg: {sim_time: number; events: SimEvent[]}) => void
): WebSocket {
  const wsBase = BASE.replace(/^http/, "ws");
  const ws = new WebSocket(`${wsBase}/ws/simulation/${encodeURIComponent(simulation_id)}`);
  ws.onmessage = (ev) => {
    try { onMessage(JSON.parse(ev.data as string)); } catch { /* ignore malformed */ }
  };
  return ws;
}
