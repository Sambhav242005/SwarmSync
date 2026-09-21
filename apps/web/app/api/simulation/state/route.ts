import { NextResponse } from "next/server";
import { simStore } from "@/lib/sim/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sid = url.searchParams.get("simulation_id") ?? "";
  const eng = simStore.get(sid);
  if (!eng) return NextResponse.json({ detail: "unknown simulation" }, { status: 404 });
  const atRaw = url.searchParams.get("at");
  if (atRaw === null) return NextResponse.json(eng.rebuild(eng.clock.sim_time));
  const t = Number(atRaw);
  if (!Number.isFinite(t))
    return NextResponse.json({ detail: "at must be float" }, { status: 400 });
  if (t < 0) return NextResponse.json({ detail: "at must be >=0" }, { status: 400 });
  return NextResponse.json(eng.rebuild(t));
}
