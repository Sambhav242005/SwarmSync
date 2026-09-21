import { describe, expect, it } from "vitest";
import { Agent } from "./agent";
import { KnowledgeStore } from "./knowledge";
describe("core", () => {
  it("agent cycles", () => { const a = new Agent("x", "d"); expect(a.step()).toBe("PERCEIVE"); });
  it("knowledge dedupes", () => {
    const k = new KnowledgeStore();
    const item = { knowledge_id: "k1", content: { poi: "p", status: "damaged" }, confidence: 0.8, version: 0 };
    expect(k.insert(item)).toBe("inserted");
    expect(k.insert(item)).toBe("duplicate");
  });
});
