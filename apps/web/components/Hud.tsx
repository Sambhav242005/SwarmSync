export function Hud({agents,online,tasks,done,net,time}:{agents:number;online:number;tasks:number;done:number;net:string;time:number}){
  return <header className="h-14 flex items-center gap-4 px-4 bg-neutral-950 text-neutral-100">
    <span className="font-bold">SWARMSYNC</span><span>EARTHQUAKE RESPONSE</span>
    <span>{agents} AGENTS</span><span>{online} ONLINE</span><span>TASKS {done}/{tasks}</span>
    <span>NET {net}</span><span>{time.toFixed(1)}s</span>
  </header>;
}
