from simulator.models.runner import run_inference
from simulator.knowledge.store import KnowledgeStore
from simulator.networking.link import link_up
def test_inference_deterministic():
    d={"cpu_score":0.7,"gpu_score":0.8,"npu_score":0.7,"battery_percent":80,"thermal_state":"normal"}
    m={"base_latency_ms":200,"memory_requirement_mb":400,"quality_score":0.85,"energy_cost":1.0,"thermal_cost":0.5,"quantization":"INT8"}
    r1=run_inference(d,m,0.5,seed=3); r2=run_inference(d,m,0.5,seed=3)
    assert r1==r2 and r1["latency_ms"]>0
def test_dedupe_and_conflict():
    s=KnowledgeStore()
    s.insert({"knowledge_id":"k1","content":{"bridge":"damaged"},"confidence":0.8,"version":1})
    assert s.insert({"knowledge_id":"k1","content":{"bridge":"damaged"},"confidence":0.8,"version":1})=="duplicate"
    s.insert({"knowledge_id":"k1","content":{"bridge":"ok"},"confidence":0.7,"version":2})
    assert len(s.conflicts())==1
def test_range_gate():
    a={"x":0,"y":0}; b={"x":100,"y":0}
    assert link_up(a,b,{"range_m":30}) is False
    assert link_up(a,b,{"range_m":200}) is True
