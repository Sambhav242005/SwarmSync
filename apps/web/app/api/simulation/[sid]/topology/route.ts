import { NextResponse } from "next/server";
import { simStore } from "@/lib/sim/store";

export async function GET(_req: Request, ctx: { params: { sid: string } }) {
  const eng = simStore.get(ctx.params.sid);
  if (!eng) return NextResponse.json({ detail: "unknown simulation" }, { status: 404 });
  return NextResponse.json(eng.topology());
}
