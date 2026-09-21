export const STATES = ["IDLE","PERCEIVE","INFER","UPDATE_KNOWLEDGE","DECIDE_COMM","SHARE","WAIT","COLLABORATE","VALIDATE","COMPLETE"] as const;
export class Agent {
  state = "IDLE";
  constructor(public agent_id: string, public device_id: string, public role = "worker") {}
  step(): string { const i = STATES.indexOf(this.state as (typeof STATES)[number]); this.state = STATES[(i + 1) % STATES.length]; return this.state; }
}
