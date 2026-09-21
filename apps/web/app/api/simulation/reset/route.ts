import { NextResponse } from "next/server";
import { simStore } from "@/lib/sim/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    simulation_id?: unknown;
    seed?: unknown;
  };
  const eng = simStore.get(typeof body.simulation_id === "string" ? body.simulation_id : "");
  if (!eng) return NextResponse.json({ detail: "unknown simulation" }, { status: 404 });
  const seed = body.seed ?? undefined;
  if (seed !== undefined && seed !== null && !Number.isInteger(seed))
    return NextResponse.json({ detail: "seed must be int-or-None" }, { status: 400 });
  eng.reset(seed == null ? undefined : (seed as number));
  return NextResponse.json({ ok: true });
}
