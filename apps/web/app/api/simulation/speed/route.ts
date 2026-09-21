import { NextResponse } from "next/server";
import { simStore } from "@/lib/sim/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    simulation_id?: unknown;
    speed?: unknown;
  };
  const s = Number(body.speed ?? 1);
  if (!Number.isFinite(s))
    return NextResponse.json({ detail: "speed must be float" }, { status: 400 });
  const eng = simStore.get(typeof body.simulation_id === "string" ? body.simulation_id : "");
  if (!eng) return NextResponse.json({ detail: "unknown simulation" }, { status: 404 });
  try {
    eng.setSpeed(s);
  } catch {
    return NextResponse.json(
      { detail: "speed must be one of 0.25,0.5,1,2,5,10" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true, speed: s });
}
