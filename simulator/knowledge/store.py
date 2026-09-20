"""Tiny knowledge store with duplicate + conflict detection."""


class KnowledgeStore:
    def __init__(self):
        self._latest = {}
        self._history = {}

    def insert(self, item):
        kid = item["knowledge_id"]
        hist = self._history.setdefault(kid, [])
        cur = self._latest.get(kid)
        if cur is not None and (
            cur["content"] == item["content"]
            and cur.get("confidence") == item.get("confidence")
            and cur.get("version") == item.get("version")
        ):
            return "duplicate"
        hist.append(dict(item))
        self._latest[kid] = dict(item)
        return "inserted" if cur is None else "updated"

    def conflicts(self):
        out = []
        for kid, hist in self._history.items():
            contents = {repr(h["content"]) for h in hist}
            if len(contents) > 1:
                out.append({"knowledge_id": kid, "versions": list(hist)})
        return out

    def find(self, knowledge_id):
        return self._latest.get(knowledge_id)
