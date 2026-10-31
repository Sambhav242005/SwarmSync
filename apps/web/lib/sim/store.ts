import type { Engine } from "./engine";

const processGlobal = globalThis as typeof globalThis & {
  __swarmsyncSimulationRegistry?: Map<string, Engine>;
};
const sims = (processGlobal.__swarmsyncSimulationRegistry ??= new Map<string, Engine>());

export const simStore = { get: (sid: string) => sims.get(sid), set: (sid: string, e: Engine) => sims.set(sid, e) };
