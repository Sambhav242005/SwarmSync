import type { SimEvent } from "./types";
export class Collector {
  messages = 0; bytes = 0; conflicts = 0; knowledge = 0; dupes = 0;
  ingest(events: SimEvent[]) {
    for (const e of events) {
      const t = e.type.toUpperCase();
      if (t === "KNOWLEDGE_SHARED") { this.messages++; this.bytes += Number((e.payload as { bytes?: number }).bytes ?? 0); this.knowledge++; }
      if (t === "CONFLICT" || t === "CONFLICT_DETECTED") this.conflicts++;
      if (t === "KNOWLEDGE_CREATED" && (e.payload as { deduped?: boolean }).deduped) this.dupes++;
    }
  }
  summary() { return { messages: this.messages, bytes: this.bytes, conflicts: this.conflicts, knowledge: this.knowledge, tasks_completed: 0, dupes: this.dupes, energy_mwh: 0, avg_confidence: 0, avg_latency_ms: 0 }; }
}
