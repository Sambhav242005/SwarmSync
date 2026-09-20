import { create } from "zustand";
import type { SimEvent } from "../../../shared/types/events";
type Slice = { simTime:number; events:SimEvent[]; selectedId:string|null; speed:number; paused:boolean;
  setEvents:(e:SimEvent[])=>void; select:(id:string|null)=>void; setSpeed:(s:number)=>void; setPaused:(p:boolean)=>void };
export const useSim = create<Slice>((set)=>({
  simTime:0, events:[], selectedId:null, speed:1, paused:true,
  setEvents:(events)=>set({events, simTime:events.at(-1)?.sim_time ?? 0}),
  select:(selectedId)=>set({selectedId}), setSpeed:(speed)=>set({speed}), setPaused:(paused)=>set({paused}),
}));
