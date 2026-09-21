import { describe, expect, it } from "vitest";
// @ts-ignore — Engine lands in Task 4; import fails at runtime until then (expected-deferred)
import { Engine } from "./engine";

describe("swarm", () => {
  it("loads 6x6x6 topology", () => {
    const e = Engine.fromScenario(7);
    const t = e.topology();
    expect(t.devices.length).toBe(6);
    expect(t.agents.length).toBe(6);
    expect(t.pois.length).toBe(6);
  });
});
