"use client";
import { useEffect, useState } from "react";
import type Phaser from "phaser";
import { Hud } from "../components/Hud";
import { Timeline } from "../components/Timeline";
import { Inspector } from "../components/Inspector";
import { Lenses, type Lens } from "../components/Lenses";
import { useSim } from "../stores/useSim";
export default function Page(){
  const {events, simTime, selectedId, select} = useSim();
  const [lens, setLens] = useState<Lens>("WORLD");
  useEffect(()=>{
    if(typeof window === "undefined") return;
    let game: Phaser.Game | undefined;
    let cancelled = false;
    import("../game/bootstrap").then(({ bootstrap })=>{
      if(cancelled) return;
      game = bootstrap("phaser-world");
    });
    return ()=>{ cancelled = true; game?.destroy(true); };
  },[]);
  return <main className="h-screen flex flex-col bg-black">
    <Hud agents={6} online={3} tasks={12} done={8} net="INTERMITTENT" time={simTime} />
    <Lenses lens={lens} onChange={setLens} />
    <div className="flex flex-1 min-h-0">
      <div id="phaser-world" data-lens={lens} className="flex-1 min-h-0" />
      <Inspector id={selectedId} events={events} onClose={()=>select(null)} />
    </div>
    <Timeline events={events} onScrub={()=>{}} />
  </main>;
}
