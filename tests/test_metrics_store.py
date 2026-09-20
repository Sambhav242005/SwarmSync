from simulator.metrics.collector import Collector
def test_collector_counts():
    c=Collector()
    c.ingest([{"type":"KNOWLEDGE_SHARED","payload":{"bytes":100}}, {"type":"CONFLICT","payload":{}}])
    s=c.summary()
    assert s["messages"]==1 and s["bytes"]==100 and s["conflicts"]==1
