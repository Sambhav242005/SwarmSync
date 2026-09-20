"use client";
import { useMemo, useState } from "react";
import type { SimEvent } from "../../../shared/types/events";
import { TraceView } from "./TraceView";

type Tab = "TRACE" | "KNOWLEDGE" | "NETWORK";

function str(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);
  try { return JSON.stringify(v); } catch { return "—"; }
}

/** Render-only slide-in inspector. Derives all sections from engine events. */
export function Inspector({
  id,
  events,
  onClose,
}: {
  id: string | null;
  events: SimEvent[];
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("TRACE");
  const related = useMemo(
    () => (id ? events.filter((e) => e.event_id === id || e.source === id || e.target === id) : []),
    [events, id]
  );
  const latest = related.at(-1);
  const p = (latest?.payload ?? {}) as Record<string, unknown>;

  if (!id) return null;

  const device = (p.device_id ?? latest?.source ?? latest?.target ?? id) as unknown;
  const agent = (p.agent_id ?? (typeof id === "string" && id.startsWith("agent") ? id : latest?.source)) as unknown;

  const rows: [string, unknown][] = [
    ["device", device],
    ["agent", agent],
    ["status", p.status ?? latest?.type],
    ["battery", p.battery_percent ?? p.battery],
    ["ram_mb", p.ram_mb ?? p.memory_mb],
    ["cpu", p.cpu_score],
    ["gpu", p.gpu_score],
    ["npu", p.npu_score],
    ["thermal", p.thermal_state],
    ["task", p.task_id ?? p.task],
    ["model", p.model_id ?? p.model],
    ["latency_ms", p.latency_ms],
    ["quality", p.quality],
    ["confidence", p.confidence],
    ["energy_mwh", p.energy_mwh],
    ["knowledge", p.knowledge_id ?? p.knowledge],
  ];

  const knowledge = related.filter(
    (e) => e.type.includes("KNOWLEDGE") || e.type === "CONFLICT" || "knowledge_id" in (e.payload ?? {})
  );
  const network = related.filter((e) => e.source && e.target);

  return (
    <aside className="w-80 shrink-0 bg-neutral-950 text-neutral-100 p-4 flex flex-col gap-2 overflow-y-auto border-l border-neutral-800">
      <button onClick={onClose} className="self-start text-xs px-2 py-1 bg-neutral-800 rounded">
        Close
      </button>
      <h2 className="font-mono font-bold break-all">{id}</h2>
      <div className="flex gap-2">
        {(["TRACE", "KNOWLEDGE", "NETWORK"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={
              tab === t
                ? "px-2 py-1 text-xs font-bold bg-teal-500 text-black rounded"
                : "px-2 py-1 text-xs bg-neutral-800 rounded"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="opacity-60">{k}</dt>
            <dd className="font-mono break-all">{str(v)}</dd>
          </div>
        ))}
      </dl>

      {tab === "TRACE" && <TraceView events={events} focusId={id} />}
      {tab === "KNOWLEDGE" && (
        <ul className="flex flex-col gap-1 text-xs">
          {knowledge.length === 0 && <li className="opacity-70">No knowledge events.</li>}
          {knowledge.map((e) => (
            <li key={e.event_id} className="border border-neutral-700 rounded px-2 py-1 font-mono">
              {e.event_id}: {str((e.payload as Record<string, unknown>).knowledge_id ?? e.type)}
            </li>
          ))}
        </ul>
      )}
      {tab === "NETWORK" && (
        <ul className="flex flex-col gap-1 text-xs">
          {network.length === 0 && <li className="opacity-70">No network links.</li>}
          {network.map((e) => (
            <li key={e.event_id} className="border border-neutral-700 rounded px-2 py-1 font-mono">
              {e.source} → {e.target} ({e.type})
            </li>
          ))}
        </ul>
      )}

      <div className="text-xs opacity-70">
        <div className="font-bold">recent ({related.length})</div>
        <ul>
          {related.slice(-5).map((e) => (
            <li key={e.event_id} className="font-mono">
              {e.event_id} {e.type} @{e.sim_time.toFixed(2)}s
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
