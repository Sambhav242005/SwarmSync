from pydantic import BaseModel
from typing import Optional
class SimEvent(BaseModel):
    event_id: str
    sim_time: float
    type: str
    source: Optional[str] = None
    target: Optional[str] = None
    payload: dict = {}
    causality: list[str] = []
    def to_dict(self):
        return self.model_dump()
