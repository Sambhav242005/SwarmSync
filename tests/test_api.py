from fastapi.testclient import TestClient
from simulator.api.main import app
def test_create_and_step():
    c=TestClient(app)
    r=c.post("/simulation/create",json={"seed":1}).json()
    sid=r["simulation_id"]
    c.post("/simulation/start",json={"simulation_id":sid})
    s=c.post("/simulation/step",json={"simulation_id":sid,"dt":0.5}).json()
    assert "events" in s
def test_unknown_sid_404():
    c=TestClient(app)
    assert c.get("/simulation/nope/events").status_code==404
    assert c.get("/simulation/nope/metrics").status_code==404
    assert c.post("/simulation/step",json={"simulation_id":"nope","dt":0.5}).status_code==404
def test_bad_seed_400_bad_dt_400():
    c=TestClient(app)
    assert c.post("/simulation/create",json={"seed":"bad"}).status_code==400
    sid=c.post("/simulation/create",json={"seed":1}).json()["simulation_id"]
    assert c.post("/simulation/step",json={"simulation_id":sid,"dt":"bad"}).status_code==400
    assert c.post("/simulation/step",json={"simulation_id":sid,"dt":0}).status_code==400
    assert c.post("/simulation/step",json={"simulation_id":sid,"dt":-1}).status_code==400
    assert c.post("/simulation/reset",json={"simulation_id":sid,"seed":"bad"}).status_code==400
def test_create_loads_scenario_topology():
    c=TestClient(app)
    r=c.post("/simulation/create",json={"seed":7}).json()
    assert r["scenario_id"]=="earthquake_response"
    topo=c.get(f"/simulation/{r['simulation_id']}/topology").json()
    assert len(topo["devices"])==6 and len(topo["agents"])==6 and len(topo["pois"])==6
    assert c.post("/simulation/create",json={"seed":7,"scenario_id":"nope"}).status_code==400
def test_state_at_and_speed_and_metrics():
    c=TestClient(app)
    sid=c.post("/simulation/create",json={"seed":7}).json()["simulation_id"]
    c.post("/simulation/start",json={"simulation_id":sid})
    for _ in range(5): c.post("/simulation/step",json={"simulation_id":sid,"dt":0.5})
    full=c.get("/simulation/state",params={"simulation_id":sid}).json()
    assert full["sim_time"]>0 and len(full["events"])>0
    part=c.get("/simulation/state",params={"simulation_id":sid,"at":1.0}).json()
    assert part["sim_time"]==1.0
    assert len(part["events"])<len(full["events"])
    assert c.post("/simulation/speed",json={"simulation_id":sid,"speed":2.0}).json()=={"ok":True,"speed":2.0}
    assert c.post("/simulation/speed",json={"simulation_id":sid,"speed":3.0}).status_code==400
    assert c.get("/simulation/state",params={"simulation_id":sid,"at":-1}).status_code==400
    m=c.get(f"/simulation/{sid}/metrics").json()
    assert m["messages"]>0 and m["tasks_completed"]>=0 and "sim_time" in m
