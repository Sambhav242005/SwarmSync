import { NextResponse } from "next/server";
import { simStore } from "@/lib/sim/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    simulation_id?: unknown;
    dt?: unknown;
  };
  const eng = simStore.get(typeof body.simulation_id === "string" ? body.simulation_id : "");
  if (!eng) return NextResponse.json({ detail: "unknown simulation" }, { status: 404 });
  const dt = Number(body.dt ?? 0.5);
  if (!Number.isFinite(dt) || dt <= 0)
    return NextResponse.json({ detail: "dt must be >0" }, { status: 400 });
  const out = eng.step(dt);
  return NextResponse.json({ sim_time: eng.clock.sim_time, events: out });
}
