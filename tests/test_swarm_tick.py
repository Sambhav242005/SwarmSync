"""Slice-2: scenario-driven swarm tick emits real marker events."""
import json

from simulator.core.engine import Engine


def _scenario():
    with open("data/scenarios/earthquake-6.json") as f:
        scn = json.load(f)
    with open("data/model-profiles/models.json") as f:
        models = json.load(f)
    with open("data/device-profiles/android-tiers.json") as f:
        tiers = json.load(f)
    return scn, models, tiers


def _engine(seed=7):
    scn, models, tiers = _scenario()
    e = Engine(seed=seed)
    e.load_scenario(scn, models, tiers)
    e.start()
    return e


def test_scenario_load_topology():
    e = _engine()
    topo = e.topology()
    assert len(topo["devices"]) == 6
    assert len(topo["agents"]) == 6
    assert len(topo["pois"]) == 6


def test_tick_emits_markers():
    e = _engine()
    for _ in range(30):
        e.tick(0.5)
    types = {ev.type for ev in e.log.all()}
    for t in ("task_started", "knowledge_created", "knowledge_shared",
              "knowledge_validated", "agent_detected"):
        assert t in types, f"missing {t}: {sorted(types)}"


def test_same_seed_same_swarm_log():
    a = _engine()
    b = _engine()
    for _ in range(30):
        a.tick(0.5)
        b.tick(0.5)
    assert [x.to_dict() for x in a.log.all()] == [x.to_dict() for x in b.log.all()]


def test_failure_window_and_conflict_and_completion():
    e = _engine()
    for _ in range(200):
        e.tick(0.5)
    types = [ev.type for ev in e.log.all()]
    assert "device_failed" in types
    assert "device_recovered" in types
    assert "conflict_detected" in types
    assert "task_completed" in types


def test_battery_drains_with_work():
    e = _engine()
    b0 = {d["id"]: d["battery"] for d in e.topology()["devices"]}
    for _ in range(20):
        e.tick(0.5)
    b1 = {d["id"]: d["battery"] for d in e.topology()["devices"]}
    assert any(b1[k] < b0[k] for k in b0)
