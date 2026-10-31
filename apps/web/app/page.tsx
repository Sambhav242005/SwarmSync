"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controls } from "../components/Controls";
import { Hud } from "../components/Hud";
import { Inspector } from "../components/Inspector";
import { Timeline } from "../components/Timeline";
import * as api from "../lib/api";
import type { SimEvent, Topology } from "../lib/sim/types";

export default function Page() {
  const [id, setId] = useState<string | null>(null);
  const [topology, setTopology] = useState<Topology | null>(null);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [time, setTime] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [paused, setPaused] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [pending, setPending] = useState<string | null>("Creating demo");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  const mounted = useRef(false);

  const refresh = useCallback(async (sid: string) => {
    const [snapshot, world] = await Promise.all([api.getState(sid), api.getTopology(sid)]);
    if (!mounted.current) return;
    setTime(snapshot.sim_time); setEvents(snapshot.events); setTopology(world);
  }, []);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    setPending("Creating demo"); setError(null);
    api.createSimulation().then(async ({ simulation_id }) => {
      if (!active) return;
      await refresh(simulation_id);
      if (active) setId(simulation_id);
    }).catch((e: unknown) => { if (active) setError(message(e)); })
      .finally(() => { if (active) setPending(null); });
    return () => { active = false; mounted.current = false; };
  }, [attempt, refresh]);

  const command = useCallback(async (label: string, action: (sid: string) => Promise<unknown>, after?: () => void) => {
    if (!id || busy.current) return;
    busy.current = true; setPending(label); setError(null);
    try {
      await action(id);
      if (!mounted.current) return;
      after?.();
      await refresh(id);
    } catch (e) { if (mounted.current) { setError(message(e)); setPaused(true); } }
    finally { busy.current = false; if (mounted.current) setPending(null); }
  }, [id, refresh]);

  useEffect(() => {
    if (!id || paused || error) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (!active) return;
      if (!busy.current) {
        busy.current = true;
        setPending("Updating");
        try { await api.stepSimulation(id, 0.5); await refresh(id); }
        catch (e) { if (active) { setError(message(e)); setPaused(true); } }
        finally { busy.current = false; if (active) setPending(null); }
      }
      if (active) timer = setTimeout(tick, 500);
    };
    timer = setTimeout(tick, 500);
    return () => { active = false; clearTimeout(timer); };
  }, [id, paused, error, refresh]);

  return <main className="app">
    <Hud topology={topology} time={time} />
    <p className="notice">Legacy scripted demo · Not a validated research simulation. The synthetic study engine and historical state replay are not yet connected.</p>
    <div className="status" role="status" aria-live="polite">{pending ?? (id ? (paused ? "Paused" : "Playing") : "Demo unavailable")}</div>
    {error && <div className="error" role="alert">{error} {id ? "Playback stopped. Retry the action, reset, or create a new demo." : "Create a new demo to retry."} <button onClick={() => { setId(null); setTopology(null); setEvents([]); setTime(0); setSelected(null); setPaused(true); setSpeed(1); setAttempt((n) => n + 1); }}>Create new demo</button></div>}
    <Controls paused={paused} speed={speed} disabled={!id || !!pending} onPlay={() => void command("Starting", api.startSimulation, () => setPaused(false))} onPause={() => void command("Pausing", api.pauseSimulation, () => setPaused(true))} onStep={() => void command("Stepping", (sid) => api.stepSimulation(sid, 0.5))} onReset={() => void command("Resetting", api.resetSimulation, () => { setPaused(true); setSelected(null); })} onSpeed={(s) => void command("Changing speed", (sid) => api.setSpeedSimulation(sid, s), () => setSpeed(s))} />
    <div className="workspace">
      <section className="world" aria-labelledby="world-heading">
        <h1 id="world-heading">Live demo world</h1>
        <p>Select a device or agent to inspect its recorded events. Device positions and status come from the live topology.</p>
        {!topology ? <p>Waiting for topology…</p> : <div className="devices">{topology.devices.map((device) => {
          const agents = topology.agents.filter((a) => a.device === device.id);
          return <article key={device.id} className="device"><button aria-pressed={selected === device.id} onClick={() => setSelected(device.id)}>{device.id}</button><span>{device.failed ? "Offline" : "Online"} · {device.tier} · battery {device.battery}%</span><span>Position {device.x}, {device.y} · RAM {device.ram_gb} GB</span>{agents.map((agent) => <button key={agent.id} aria-pressed={selected === agent.id} onClick={() => setSelected(agent.id)}>{agent.id} · {agent.role} · {agent.state}</button>)}</article>;
        })}</div>}
      </section>
      <Inspector id={selected} events={events} onClose={() => setSelected(null)} />
    </div>
    <Timeline events={events} onSelect={setSelected} />
  </main>;
}
function message(e: unknown) { return e instanceof Error ? e.message : "The demo request failed."; }
