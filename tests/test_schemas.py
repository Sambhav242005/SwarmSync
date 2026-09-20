from shared.schemas.events import SimEvent
def test_event_schema_roundtrip():
    e = SimEvent(event_id="evt_1", sim_time=1.0, type="KNOWLEDGE_SHARED",
                 source="agent_02", target="agent_04",
                 payload={"knowledge_id":"k88","bytes":842}, causality=["evt_0"])
    assert e.to_dict()["event_id"] == "evt_1"
