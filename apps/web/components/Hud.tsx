import type { Topology } from "../lib/sim/types";
export function Hud({ topology, time }: { topology: Topology | null; time: number }) {
  return <header className="hud"><strong>SWARMSYNC</strong><span className="badge">LEGACY DEMO</span><span>Earthquake response</span><span>{topology ? `${topology.agents.length} agents` : "Agents unavailable"}</span><span>{topology ? `${topology.devices.filter((d) => !d.failed).length}/${topology.devices.length} devices online` : "Devices unavailable"}</span><span>{time.toFixed(1)}s</span></header>;
}
