from fastapi import FastAPI, WebSocket, HTTPException
import uuid
from simulator.core.engine import Engine
app=FastAPI(title="SwarmSync Simulator")
_sims: dict[str, Engine] = {}
def _get(sid: str) -> Engine:
    eng=_sims.get(sid)
    if eng is None: raise HTTPException(status_code=404, detail=f"unknown simulation_id {sid}")
    return eng
@app.post("/simulation/create")
def create(body: dict):
    try: seed=int(body.get("seed",0))
    except (TypeError, ValueError): raise HTTPException(status_code=400, detail="seed must be int")
    sid=f"sim_{uuid.uuid4().hex[:6]}"
    _sims[sid]=Engine(seed=seed)
    return {"simulation_id":sid}
@app.post("/simulation/start")
def start(body: dict): _get(body.get("simulation_id","")).start(); return {"ok":True}
@app.post("/simulation/pause")
def pause(body: dict): _get(body.get("simulation_id","")).pause(); return {"ok":True}
@app.post("/simulation/reset")
def reset(body: dict):
    seed=body.get("seed")
    if seed is not None:
        try: seed=int(seed)
        except (TypeError, ValueError): raise HTTPException(status_code=400, detail="seed must be int-or-None")
    _get(body.get("simulation_id","")).reset(seed); return {"ok":True}
@app.post("/simulation/step")
def step(body: dict):
    try: dt=float(body.get("dt",0.5))
    except (TypeError, ValueError): raise HTTPException(status_code=400, detail="dt must be float")
    if not dt>0: raise HTTPException(status_code=400, detail="dt must be >0")
    e=_get(body.get("simulation_id","")); out=e.step(dt)
    return {"sim_time":e.clock.sim_time,"events":[x.to_dict() for x in out]}
@app.get("/simulation/state")
def state(simulation_id: str):
    eng=_get(simulation_id); return eng.rebuild(eng.clock.sim_time)
@app.get("/simulation/{sid}/events")
def events(sid: str): return [x.to_dict() for x in _get(sid).log.all()]
@app.get("/simulation/{sid}/metrics")
def metrics(sid: str): return {"messages":len(_get(sid).log.all())}
@app.websocket("/ws/simulation/{sid}")
async def ws(ws: WebSocket, sid: str):
    await ws.accept()
    eng=_sims.get(sid)
    if eng is None: await ws.close(); return
    await ws.send_json({"sim_time":eng.clock.sim_time,"events":[x.to_dict() for x in eng.log.up_to(eng.clock.sim_time)]})
    await ws.close()
