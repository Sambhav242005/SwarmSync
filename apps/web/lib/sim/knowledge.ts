export type KItem = { knowledge_id: string; content: unknown; confidence: number; version: number };
export class KnowledgeStore {
  private latest = new Map<string, KItem>(); private hist = new Map<string, KItem[]>();
  insert(item: KItem): string {
    const cur = this.latest.get(item.knowledge_id);
    if (cur && JSON.stringify(cur.content) === JSON.stringify(item.content) && cur.confidence === item.confidence && cur.version === item.version) return "duplicate";
    const h = this.hist.get(item.knowledge_id) ?? []; h.push({ ...item }); this.hist.set(item.knowledge_id, h);
    this.latest.set(item.knowledge_id, { ...item });
    return cur ? "updated" : "inserted";
  }
  conflicts(): { knowledge_id: string; versions: KItem[] }[] {
    const out: { knowledge_id: string; versions: KItem[] }[] = [];
    for (const [kid, h] of this.hist) { if (new Set(h.map((x) => JSON.stringify(x.content))).size > 1) out.push({ knowledge_id: kid, versions: [...h] }); }
    return out;
  }
}
