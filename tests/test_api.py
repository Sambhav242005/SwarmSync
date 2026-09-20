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
