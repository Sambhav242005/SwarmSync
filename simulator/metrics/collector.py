class Collector:
    def __init__(self): self.messages=0; self.bytes=0; self.conflicts=0; self.knowledge=0; self.dupes=0
    def ingest(self, events):
        for e in events:
            t=e["type"] if isinstance(e,dict) else e.type
            p=e.get("payload",{}) if isinstance(e,dict) else e.payload
            tu=str(t).upper()
            if tu=="KNOWLEDGE_SHARED":
                self.messages+=1
                try: self.bytes+=int(p.get("bytes",0))
                except (TypeError, ValueError): pass
                self.knowledge+=1
            if tu in ("CONFLICT","CONFLICT_DETECTED"): self.conflicts+=1
            if tu=="KNOWLEDGE_CREATED" and p.get("deduped"): self.dupes+=1
    def summary(self):
        return {"messages":self.messages,"bytes":self.bytes,"conflicts":self.conflicts,"knowledge":self.knowledge,
                "tasks_completed":0,"dupes":self.dupes,"energy_mwh":0.0,"avg_confidence":0.0,"avg_latency_ms":0.0}
