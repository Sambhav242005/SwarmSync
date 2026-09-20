export function Timeline({events,onScrub}:{events:{sim_time:number;type:string}[];onScrub:(t:number)=>void}){
  return <footer className="h-24 bg-neutral-950 px-4 py-2">
    <input type="range" min={0} max={Math.max(...events.map(e=>e.sim_time),1)} step={0.1}
      onChange={(e)=>onScrub(Number(e.target.value))} className="w-full" aria-label="timeline" />
    <div className="flex gap-1">{events.slice(-20).map((e,i)=><span key={i} title={e.type} className="h-2 w-2 rounded-full bg-teal-400" />)}</div>
  </footer>;
}
