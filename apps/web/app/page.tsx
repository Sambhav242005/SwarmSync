"use client";
import { Hud } from "../components/Hud";
import { Timeline } from "../components/Timeline";
import { useSim } from "../stores/useSim";
export default function Page(){
  const {events, simTime} = useSim();
  return <main className="h-screen flex flex-col bg-black">
    <Hud agents={6} online={3} tasks={12} done={8} net="INTERMITTENT" time={simTime} />
    <div id="phaser-world" className="flex-1 min-h-0" />
    <Timeline events={events} onScrub={()=>{}} />
  </main>;
}
