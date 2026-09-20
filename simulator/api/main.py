from fastapi import FastAPI, WebSocket
import uuid
from simulator.core.engine import Engine
app=FastAPI(title="SwarmSync Simulator")
_sims: dict[str, Engine] = {}
@app.post("/simulation/create")
def create(body: dict):
    sid=f"sim_{uuid.uuid4().hex[:6]}"
    _sims[sid]=Engine(seed=int(body.get("seed",0)))
    return {"simulation_id":sid}
@app.post("/simulation/start")
def start(body: dict): _sims[body["simulation_id"]].start(); return {"ok":True}
@app.post("/simulation/pause")
def pause(body: dict): _sims[body["simulation_id"]].pause(); return {"ok":True}
@app.post("/simulation/reset")
def reset(body: dict):
    _sims[body["simulation_id"]].reset(body.get("seed")); return {"ok":True}
@app.post("/simulation/step")
def step(body: dict):
    e=_sims[body["simulation_id"]]; out=e.step(float(body.get("dt",0.5)))
    return {"sim_time":e.clock.sim_time,"events":[x.to_dict() for x in out]}
@app.get("/simulation/state")
def state(simulation_id: str): return _sims[simulation_id].rebuild(_sims[simulation_id].clock.sim_time)
@app.get("/simulation/{sid}/events")
def events(sid: str): return [x.to_dict() for x in _sims[sid].log.all()]
@app.get("/simulation/{sid}/metrics")
def metrics(sid: str): return {"messages":len(_sims[sid].log.all())}
@app.websocket("/ws/simulation/{sid}")
async def ws(ws: WebSocket, sid: str):
    await ws.accept()
    eng=_sims.get(sid)
    if eng is None: await ws.close(); return
    await ws.send_json({"sim_time":eng.clock.sim_time,"events":[x.to_dict() for x in eng.log.up_to(eng.clock.sim_time)]})
    await ws.close()
