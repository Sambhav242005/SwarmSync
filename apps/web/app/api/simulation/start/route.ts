import { NextResponse } from "next/server";
import { simStore } from "@/lib/sim/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { simulation_id?: unknown };
  const eng = simStore.get(typeof body.simulation_id === "string" ? body.simulation_id : "");
  if (!eng) return NextResponse.json({ detail: "unknown simulation" }, { status: 404 });
  eng.start();
  return NextResponse.json({ ok: true });
}
