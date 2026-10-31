import type { Topology } from "../lib/sim/types";
export function Hud({ topology, time }: { topology: Topology | null; time: number }) {
  return <header className="hud"><strong>SwarmSync</strong><span className="badge">Legacy demo</span><span className="scenario">Earthquake response</span><span>{topology ? `${topology.agents.length} agents` : "Agents unavailable"}</span><span>{topology ? `${topology.devices.filter((d) => !d.failed).length}/${topology.devices.length} devices online` : "Devices unavailable"}</span><span className="clock" aria-label="Simulation time">{time.toFixed(1)} s</span></header>;
}
