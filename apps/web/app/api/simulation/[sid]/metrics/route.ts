import { NextResponse } from "next/server";
import { Collector } from "@/lib/sim/collector";
import { simStore } from "@/lib/sim/store";

export async function GET(_req: Request, ctx: { params: { sid: string } }) {
  const eng = simStore.get(ctx.params.sid);
  if (!eng) return NextResponse.json({ detail: "unknown simulation" }, { status: 404 });
  const col = new Collector();
  col.ingest(eng.log.all());
  const out = col.summary() as Record<string, number>;
  out.tasks_completed = eng.log.all().filter((x) => x.type === "task_completed").length;
  out.sim_time = eng.clock.sim_time;
  return NextResponse.json(out);
}
