from simulator.core.engine import Engine
def test_same_seed_same_log():
    a = Engine(seed=7); a.start()
    for _ in range(10): a.tick(0.5)
    b = Engine(seed=7); b.start()
    for _ in range(10): b.tick(0.5)
    assert [e.to_dict() for e in a.log.all()] == [e.to_dict() for e in b.log.all()]
def test_rebuild_rewinds():
    e = Engine(seed=7); e.start()
    for _ in range(20): e.tick(0.5)
    s5 = e.rebuild(5.0)
    assert s5["sim_time"] == 5.0
