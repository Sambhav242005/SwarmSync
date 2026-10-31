const baseUrl = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

async function request(label, path, { method = "GET", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  console.log(`${method} ${path} -> ${response.status} ${label}`);
  if (!response.ok) throw new Error(`${label} failed (${response.status}): ${text}`);
  return text ? JSON.parse(text) : undefined;
}

const created = await request("create", "/api/simulation/create", {
  method: "POST",
  body: { seed: 11 },
});
const sid = created.simulation_id;
if (typeof sid !== "string" || sid.length === 0) throw new Error("create returned no simulation_id");

await request("state", `/api/simulation/state?simulation_id=${encodeURIComponent(sid)}`);
await request("topology", `/api/simulation/${encodeURIComponent(sid)}/topology`);
await request("start", "/api/simulation/start", { method: "POST", body: { simulation_id: sid } });
await request("step", "/api/simulation/step", {
  method: "POST",
  body: { simulation_id: sid, dt: 0.5 },
});
await request("speed", "/api/simulation/speed", {
  method: "POST",
  body: { simulation_id: sid, speed: 2 },
});
await request("pause", "/api/simulation/pause", { method: "POST", body: { simulation_id: sid } });
await request("reset", "/api/simulation/reset", {
  method: "POST",
  body: { simulation_id: sid, seed: 11 },
});
await request("events", `/api/simulation/${encodeURIComponent(sid)}/events`);
await request("metrics", `/api/simulation/${encodeURIComponent(sid)}/metrics`);

const unknown = await fetch(`${baseUrl}/api/simulation/state?simulation_id=sim_intentionally_unknown`);
const unknownBody = await unknown.text();
console.log(`GET /api/simulation/state?simulation_id=sim_intentionally_unknown -> ${unknown.status} unknown id`);
if (unknown.status !== 404 || !unknownBody.includes("unknown simulation")) {
  throw new Error(`unknown simulation should return 404: ${unknown.status} ${unknownBody}`);
}

console.log(`PASS simulation HTTP flow (${sid})`);
