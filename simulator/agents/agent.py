"""Minimal agent with deterministic state cycle."""

STATES = ("IDLE", "PERCEIVE", "INFER", "UPDATE_KNOWLEDGE", "DECIDE_COMM", "SHARE", "WAIT", "COLLABORATE", "VALIDATE", "COMPLETE")


class Agent:
    def __init__(self, agent_id, device_id, role="worker"):
        self.agent_id = agent_id
        self.device_id = device_id
        self.role = role
        self.state = STATES[0]

    def step(self):
        i = STATES.index(self.state)
        self.state = STATES[(i + 1) % len(STATES)]
        return self.state
