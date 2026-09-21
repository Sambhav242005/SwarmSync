import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { Engine } from "@/lib/sim/engine";
import { simStore } from "@/lib/sim/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    seed?: unknown;
    scenario_id?: unknown;
  };
  const seed = body.seed ?? 0;
  if (!Number.isInteger(seed))
    return NextResponse.json({ detail: "seed must be int" }, { status: 400 });
  const scenario_id = body.scenario_id ?? "earthquake_response";
  if (typeof scenario_id !== "string")
    return NextResponse.json({ detail: "scenario_id must be str" }, { status: 400 });
  if (scenario_id !== "earthquake_response")
    return NextResponse.json({ detail: `unknown scenario_id ${scenario_id}` }, { status: 400 });
  const sid = `sim_${randomUUID().replace(/-/g, "").slice(0, 6)}`;
  const eng = Engine.fromScenario(seed as number);
  simStore.set(sid, eng);
  return NextResponse.json({ simulation_id: sid, scenario_id });
}
