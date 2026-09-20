import sqlite3, json, time, uuid
SCHEMA="CREATE TABLE IF NOT EXISTS runs(run_id TEXT PRIMARY KEY, ts REAL, config TEXT, seed INTEGER, metrics TEXT)"
class RunStore:
    def __init__(self, path="experiments/runs/runs.db"): self.path=path
    def save_run(self, config, seed, metrics, events):
        import os; os.makedirs(os.path.dirname(self.path) or "experiments/runs", exist_ok=True)
        with sqlite3.connect(self.path) as con:
            con.execute(SCHEMA)
            rid=f"run_{uuid.uuid4().hex[:8]}"
            con.execute("INSERT INTO runs VALUES(?,?,?,?,?)",(rid,time.time(),json.dumps(config),seed,json.dumps({"metrics":metrics,"events":events})))
            con.commit(); return rid
