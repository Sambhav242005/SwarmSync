import type { Engine } from "./engine";
const sims = new Map<string, Engine>();
export const simStore = { get: (sid: string) => sims.get(sid), set: (sid: string, e: Engine) => sims.set(sid, e) };
