import { describe, expect, it } from "vitest";
import { Engine } from "./engine";

describe("swarm", () => {
  it("loads 6x6x6 topology", () => {
    const e = Engine.fromScenario(7);
    const t = e.topology();
    expect(t.devices.length).toBe(6);
    expect(t.agents.length).toBe(6);
    expect(t.pois.length).toBe(6);
  });

  it("tick emits markers", () => {
    const e = Engine.fromScenario(7);
    e.start();
    for (let i = 0; i < 30; i++) e.tick(0.5);
    const types = new Set(e.log.all().map((ev) => ev.type));
    for (const t of ["task_started", "knowledge_created", "knowledge_shared", "knowledge_validated", "agent_detected"]) {
      expect(types.has(t), `missing ${t}: ${[...types].sort().join(",")}`).toBe(true);
    }
  });

  it("same seed same log", () => {
    const a = Engine.fromScenario(7);
    const b = Engine.fromScenario(7);
    a.start();
    b.start();
    for (let i = 0; i < 30; i++) { a.tick(0.5); b.tick(0.5); }
    expect(a.log.all()).toEqual(b.log.all());
  });

  it("reset propagates new seed to world", () => {
    const run30 = (e: Engine) => { e.start(); for (let i = 0; i < 30; i++) e.tick(0.5); return JSON.stringify(e.log.all()); };
    const r = Engine.fromScenario(7);
    r.reset(42);
    const logR = run30(r);
    expect(logR).not.toBe(run30(Engine.fromScenario(7)));
    expect(logR).toBe(run30(Engine.fromScenario(42)));
  });

  it("failure window and conflict and completion", () => {
    const e = Engine.fromScenario(7);
    e.start();
    for (let i = 0; i < 200; i++) e.tick(0.5);
    const types = e.log.all().map((ev) => ev.type);
    expect(types).toContain("device_failed");
    expect(types).toContain("device_recovered");
    expect(types).toContain("conflict_detected");
    expect(types).toContain("task_completed");
  });

  it("battery drains with work", () => {
    const e = Engine.fromScenario(7);
    e.start();
    const b0 = Object.fromEntries(e.topology().devices.map((d) => [d.id, d.battery]));
    for (let i = 0; i < 20; i++) e.tick(0.5);
    const b1 = Object.fromEntries(e.topology().devices.map((d) => [d.id, d.battery]));
    expect(Object.keys(b0).some((k) => b1[k] < b0[k])).toBe(true);
  });
});
