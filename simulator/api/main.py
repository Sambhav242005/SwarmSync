from fastapi import FastAPI, WebSocket, HTTPException
import json
import uuid
from pathlib import Path
from simulator.core.engine import Engine
from simulator.metrics.collector import Collector
app=FastAPI(title="SwarmSync Simulator")
_sims: dict[str, Engine] = {}
ROOT=Path(__file__).resolve().parents[2]
def _get(sid: str) -> Engine:
    eng=_sims.get(sid)
    if eng is None: raise HTTPException(status_code=404, detail=f"unknown simulation_id {sid}")
    return eng
def _read_json(path: Path):
    with open(path) as f: return json.load(f)
def _find_scenario(scenario_id: str) -> dict:
    for path in sorted((ROOT/"data"/"scenarios").glob("*.json")):
        scn=_read_json(path)
        if scn.get("scenario_id")==scenario_id: return scn
    raise HTTPException(status_code=400, detail=f"unknown scenario_id {scenario_id}")
@app.post("/simulation/create")
def create(body: dict):
    try: seed=int(body.get("seed",0))
    except (TypeError, ValueError): raise HTTPException(status_code=400, detail="seed must be int")
    scenario_id=body.get("scenario_id","earthquake_response")
    if not isinstance(scenario_id,str): raise HTTPException(status_code=400, detail="scenario_id must be str")
    sid=f"sim_{uuid.uuid4().hex[:6]}"
    eng=Engine(seed=seed)
    scn=_find_scenario(scenario_id)
    models=_read_json(ROOT/"data"/"model-profiles"/"models.json")
    tiers=_read_json(ROOT/"data"/"device-profiles"/"android-tiers.json")
    eng.load_scenario(scn, models, tiers)
    _sims[sid]=eng
    return {"simulation_id":sid,"scenario_id":scenario_id}
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
def state(simulation_id: str, at: float | None = None):
    eng=_get(simulation_id)
    if at is None: return eng.rebuild(eng.clock.sim_time)
    try: t=float(at)
    except (TypeError, ValueError): raise HTTPException(status_code=400, detail="at must be float")
    if t<0: raise HTTPException(status_code=400, detail="at must be >=0")
    return eng.rebuild(t)
@app.get("/simulation/{sid}/events")
def events(sid: str): return [x.to_dict() for x in _get(sid).log.all()]
@app.get("/simulation/{sid}/topology")
def topology(sid: str): return _get(sid).topology()
@app.post("/simulation/speed")
def speed(body: dict):
    try: s=float(body.get("speed",1.0))
    except (TypeError, ValueError): raise HTTPException(status_code=400, detail="speed must be float")
    try: _get(body.get("simulation_id","")).set_speed(s)
    except ValueError: raise HTTPException(status_code=400, detail="speed must be one of 0.25,0.5,1,2,5,10")
    return {"ok":True,"speed":s}
@app.get("/simulation/{sid}/metrics")
def metrics(sid: str):
    eng=_get(sid)
    col=Collector(); col.ingest([x.to_dict() for x in eng.log.all()])
    out=col.summary()
    out["tasks_completed"]=sum(1 for x in eng.log.all() if x.type=="task_completed")
    out["sim_time"]=eng.clock.sim_time
    return out
@app.websocket("/ws/simulation/{sid}")
async def ws(ws: WebSocket, sid: str):
    await ws.accept()
    eng=_sims.get(sid)
    if eng is None: await ws.close(); return
    await ws.send_json({"sim_time":eng.clock.sim_time,"events":[x.to_dict() for x in eng.log.up_to(eng.clock.sim_time)]})
    await ws.close()
