import type { SimEvent, Topology } from "@/lib/sim/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, init);
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: unknown } | null;
    const detail = typeof body?.detail === "string" ? `: ${body.detail}` : "";
    throw new Error(`Demo request failed (${response.status})${detail}`);
  }
  return response.json() as Promise<T>;
}
function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
export async function createSimulation(seed = 0, scenario_id = "earthquake_response") { return post<{ simulation_id: string; scenario_id: string }>("/simulation/create", { seed, scenario_id }); }
export async function setSpeedSimulation(simulation_id: string, speed: number) { return post<{ ok: boolean; speed: number }>("/simulation/speed", { simulation_id, speed }); }
export type { Topology } from "@/lib/sim/types";
export async function getTopology(simulation_id: string) { return request<Topology>(`/simulation/${encodeURIComponent(simulation_id)}/topology`); }
export async function startSimulation(simulation_id: string) { return post<{ ok: boolean }>("/simulation/start", { simulation_id }); }
export async function pauseSimulation(simulation_id: string) { return post<{ ok: boolean }>("/simulation/pause", { simulation_id }); }
export async function stepSimulation(simulation_id: string, dt = 0.5) { return post<{ sim_time: number; events: SimEvent[] }>("/simulation/step", { simulation_id, dt }); }
export async function resetSimulation(simulation_id: string, seed?: number) { return post<{ ok: boolean }>("/simulation/reset", { simulation_id, seed }); }
export async function getState(simulation_id: string, at?: number) { const q = at === undefined ? "" : `&at=${encodeURIComponent(at)}`; return request<{ sim_time: number; events: SimEvent[] }>(`/simulation/state?simulation_id=${encodeURIComponent(simulation_id)}${q}`); }
export async function getEvents(simulation_id: string) { return request<SimEvent[]>(`/simulation/${encodeURIComponent(simulation_id)}/events`); }
export async function getMetrics(simulation_id: string) { return request<Record<string, number>>(`/simulation/${encodeURIComponent(simulation_id)}/metrics`); }
export async function pollState(simulation_id: string, at?: number) { return getState(simulation_id, at); }
