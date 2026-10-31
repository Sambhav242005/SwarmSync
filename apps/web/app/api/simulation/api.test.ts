import { describe, expect, it, vi } from "vitest";
import { POST as create } from "./create/route";
import { POST as start } from "./start/route";
import { POST as step } from "./step/route";
import { POST as reset } from "./reset/route";
import { POST as speed } from "./speed/route";
import { GET as state } from "./state/route";
import { GET as events } from "./[sid]/events/route";
import { GET as topology } from "./[sid]/topology/route";
import { GET as metrics } from "./[sid]/metrics/route";

function post(body: unknown): Request {
  return new Request("http://localhost/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function stateUrl(sid: string, at?: number | string): Request {
  const q = at === undefined ? "" : `&at=${at}`;
  return new Request(`http://localhost/?simulation_id=${sid}${q}`);
}

const dummy = new Request("http://localhost/");

async function makeSid(seed = 1): Promise<string> {
  const r = await create(post({ seed }));
  expect(r.status).toBe(200);
  const j = (await r.json()) as { simulation_id: string };
  return j.simulation_id;
}

describe("api (port of test_api.py)", () => {
  it("shares simulation ownership across separately evaluated route modules", async () => {
    vi.resetModules();
    const createRoute = await import("./create/route");
    const created = await createRoute.POST(post({ seed: 11 }));
    expect(created.status).toBe(200);
    const { simulation_id } = (await created.json()) as { simulation_id: string };

    vi.resetModules();
    const stepRoute = await import("./step/route");
    const stepped = await stepRoute.POST(post({ simulation_id, dt: 0.5 }));
    expect(stepped.status).toBe(200);
  });

  it("create and step returns events", async () => {
    const sid = await makeSid(1);
    expect((await (await start(post({ simulation_id: sid }))).json())).toEqual({ ok: true });
    const s = await step(post({ simulation_id: sid, dt: 0.5 }));
    expect(s.status).toBe(200);
    const j = (await s.json()) as { events: unknown[] };
    expect(j.events).toBeDefined();
  });

  it("unknown sid 404", async () => {
    expect((await events(dummy, { params: { sid: "nope" } })).status).toBe(404);
    expect((await metrics(dummy, { params: { sid: "nope" } })).status).toBe(404);
    expect((await step(post({ simulation_id: "nope", dt: 0.5 }))).status).toBe(404);
  });

  it("bad seed 400, bad dt 400, bad reset seed 400", async () => {
    expect((await create(post({ seed: "bad" }))).status).toBe(400);
    const sid = await makeSid(1);
    expect((await step(post({ simulation_id: sid, dt: "bad" }))).status).toBe(400);
    expect((await step(post({ simulation_id: sid, dt: 0 }))).status).toBe(400);
    expect((await step(post({ simulation_id: sid, dt: -1 }))).status).toBe(400);
    expect((await reset(post({ simulation_id: sid, seed: "bad" }))).status).toBe(400);
  });

  it("create loads scenario topology 6x6x6, bad scenario 400", async () => {
    const r = await create(post({ seed: 7 }));
    expect(r.status).toBe(200);
    const j = (await r.json()) as { simulation_id: string; scenario_id: string };
    expect(j.scenario_id).toBe("earthquake_response");
    const t = await topology(dummy, { params: { sid: j.simulation_id } });
    expect(t.status).toBe(200);
    const topo = (await t.json()) as { devices: unknown[]; agents: unknown[]; pois: unknown[] };
    expect(topo.devices.length).toBe(6);
    expect(topo.agents.length).toBe(6);
    expect(topo.pois.length).toBe(6);
    expect((await create(post({ seed: 7, scenario_id: "nope" }))).status).toBe(400);
  });

  it("state at + speed + metrics", async () => {
    const sid = await makeSid(7);
    await start(post({ simulation_id: sid }));
    for (let i = 0; i < 5; i++) await step(post({ simulation_id: sid, dt: 0.5 }));
    const full = (await (await state(stateUrl(sid))).json()) as {
      sim_time: number;
      events: unknown[];
    };
    expect(full.sim_time).toBeGreaterThan(0);
    expect(full.events.length).toBeGreaterThan(0);
    const part = (await (await state(stateUrl(sid, 1.0))).json()) as {
      sim_time: number;
      events: unknown[];
    };
    expect(part.sim_time).toBe(1.0);
    expect(part.events.length).toBeLessThan(full.events.length);
    const ok = await speed(post({ simulation_id: sid, speed: 2.0 }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true, speed: 2.0 });
    expect((await speed(post({ simulation_id: sid, speed: 3.0 }))).status).toBe(400);
    expect((await state(stateUrl(sid, -1))).status).toBe(400);
    const m = await metrics(dummy, { params: { sid } });
    expect(m.status).toBe(200);
    const mj = (await m.json()) as Record<string, number>;
    expect(mj.messages).toBeGreaterThan(0);
    expect(mj.tasks_completed).toBeGreaterThanOrEqual(0);
    expect(mj.sim_time).toBeDefined();
  });
});
