from fastapi.testclient import TestClient
from simulator.api.main import app
def test_create_and_step():
    c=TestClient(app)
    r=c.post("/simulation/create",json={"seed":1}).json()
    sid=r["simulation_id"]
    c.post("/simulation/start",json={"simulation_id":sid})
    s=c.post("/simulation/step",json={"simulation_id":sid,"dt":0.5}).json()
    assert "events" in s
