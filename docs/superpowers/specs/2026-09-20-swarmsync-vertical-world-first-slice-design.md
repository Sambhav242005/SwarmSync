# SwarmSync Simulator — Vertical World-First Slice Design

> Historical record. Current requirements, implementation decisions and execution status are in [SPEC.md](../../../SPEC.md), [DESIGN.md](../../../DESIGN.md) and [TODO.md](../../../TODO.md). Retained as history; earlier stacks, completion assumptions and worker instructions below do not govern the current research milestone.

Date: 2026-09-20
Status: Approved design, pending user review of spec
Slice: Minimal engine + WS + Next.js Phaser world + HUD + inspector + earthquake 6 agents + full rewind

## 1. Goal
Prove living swarm feel + research reproducibility in one thin vertical slice.
User launches earthquake scenario, watches Android devices infer locally, share knowledge, lose/recover net, resolve conflicts, complete task, scrubs timeline backwards, inspects TRACE.

Non-goals slice:
- Full LAB analytics, full scenario editor UI, PG migration, real model inference.
- Only earthquake scenario, only 6 agents, only 5 comm strategies as config (no full benchmark UI yet).

## 2. Architecture (Approach A approved)
Monorepo `swarm-sync-simulator/`:
- `apps/web/` app/components/game/stores/hooks/lib/styles
- `simulator/` api/core/agents/devices/models/networking/knowledge/tasks/resources/experiments/metrics/scenarios
- `shared/schemas/types`
- `data/scenarios/datasets/model-profiles/device-profiles`
- `experiments/runs/`
- `docs/` architecture.md simulation-model.md research-experiments.md metrics.md scenario-format.md

Rules:
- Engine owns truth, headless, no Phaser dependency.
- Frontend thin renderer only. No sim logic in React.
- Deterministic tick + seeded RNG. Same scenario+seed+config = same results.
- Immutable event log. Every event: event_id, simulation_time, event_type, source/target, payload, causality.
- State rebuild = replay log to t. Snapshots periodic for fast scrub.
- Speeds: 0.25x 0.5x 1x 2x 5x 10x. Controls: play/pause/step/reset.

API:
- POST /simulation/create/start/pause/reset/step
- GET /simulation/state, GET /simulation/{id}/metrics, GET /simulation/{id}/events
- WS /ws/simulation/{simulation_id}: state+agent+network+knowledge+resource+metric updates.

Frontend:
- Next.js React TS Tailwind shadcn, Phaser 3 world 80-90% viewport.
- Top HUD only: SwarmSync, scenario, sim time, agent count, online/offline/degraded, task progress, network status, play/pause/step, speed.
- No permanent dashboard cards over world.
- Slide-in inspector on select, collapses on deselect. Buttons TRACE/KNOWLEDGE/NETWORK.
- Bottom timeline persistent, draggable, event markers, supports play/pause/step ff/slow/replay.
- Lenses WORLD/NETWORK/KNOWLEDGE/MODEL/RESOURCE change overlays on same world.
- LAB separate route for experiments/scenarios/benchmarks/metrics. No analytics clutter on sim screen.
- Zustand slices separate: simulation/world/devices/agents/network/knowledge/tasks/events/metrics/selected_entity/UI.

Storage:
- SQLite now via repository layer, PG-ready interface. Every run: run_id/timestamp/config/seed/metrics/event log.

## 3. Components
Device: device_id, display_name, manufacturer/SoC, ram_gb, cpu/gpu/npu scores, storage, battery cap/current, thermal, net interfaces, runtimes, installed models, running agents, knowledge store, connectivity.
Profiles JSON: high-end, upper-mid, mid, low-end. No hardcode single phone.

ModelProfile JSON/YAML: model_id/name/type/params/precision/quant/size_mb/mem_mb/base_latency_ms/quality/energy/thermal/supported_tasks/runtimes.
Types: ocr, object_detection, image_classification, vision_encoder, embedding, asr, summarizer, small_llm, reasoning_llm. Quants FP32/FP16/INT8/INT4.

`run_inference(device,model,task)` returns latency_ms/memory_mb/energy_mwh/quality/confidence from capability*quant*complexity*thermal*battery*contention, seeded. Interface `ModelRunner: SimulatedModelRunner | RealModelRunner` (real later).

Agent: identity/device/role/goals/models/knowledge/confidence/task/battery-awareness/policy/memory. Lifecycle IDLE→PERCEIVE→INFER→UPDATE_KNOWLEDGE→DECIDE_COMM→SHARE/WAIT→COLLABORATE→VALIDATE→COMPLETE.
Roles slice: A Vision+OCR, B Vision, C SmallLLM, D OCR+reasoning, E Embedding+validator, F Coordinator.

Knowledge object: knowledge_id/agent_id/task_id/type/content/confidence/source/timestamp/version. Types observation/entity/fact/inference/summary/contradiction/task_result. Ops insert/version/dedupe/conflict/freshness/propagate/sync. Share structured knowledge, not raw images.

Network fully simulated: online/intermittent/offline, bandwidth/latency/loss/range/discovery/energy/size. Range-gated connections, recover on return.

Comm strategies: NO_COMM, FULL, PERIODIC, RELEVANCE, ADAPTIVE U(m)=wr*rel+wi*gain+wu*unc-wb*cost, weights configurable. No novelty claims.

Tasks scenario-driven: earthquake world POIs (damaged buildings/roads/bridges/checkpoints/medical/survivors), incomplete/dupe/conflict observations, 1 temp failure. Goal locate damaged infra + prioritize.

## 4. Data flow slice
Tick → perceive → infer → knowledge create → dedupe/conflict check → utility decide → range-checked send → packet animation only on real KNOWLEDGE_SHARED → receive → validate → metrics.
Battery drops only from work/net. Latency rises only from simulated cause. Lines/packets map 1:1 to events.

Agent visual states: ONLINE/OFFLINE/DEGRADED/WORKING/COMMUNICATING/ERROR + battery bar + id + task. Packet colors by kind observation/inference/task/validation/conflict/knowledge.

## 5. Replay / TRACE
Event-sourced log + snapshots. Scrub backwards rebuilds visible state. Markers agent_detected/task_started/knowledge_created/shared/network_lost/conflict/validated/completed.
TRACE mode: causal chain graph Agent→inference→observation→confidence→decision→send→reason→validate→result linked to real event_ids.

Perf: event buffer + aggregation, supports 50 devices / 100+ agents / thousands knowledge without freeze.

## 6. Error / robustness
Offline/degraded/error visuals, disruption effect, loss from params, stale flags, version-vector/timestamp conflicts, recovery time tracked.

## 7. Testing slice
Determinism, resource consumption, latency estimator, lifecycle transitions, creation/dedupe/conflict/sync, loss, strategies, metrics calc. No fake animations without causal event.

## 8. Docs slice
Create docs/architecture.md simulation-model.md research-experiments.md metrics.md scenario-format.md. Assumptions separate from real HW measurements. Never present sim values as real Android measurements.

## 9. Success criteria slice
Launch earthquake → watch infer→create→discover→share→validate→resolve→conclude with live telemetry (messages/bytes/latency/tasks/knowledge/dupes/conflicts/energy/confidence) → scrub back → forward → TRACE one chain → inspector shows device/agent/status/resources/models/task/inference/network/knowledge/events.

## 10. Next after slice
- writing-plans skill → implementation plan
- Then PHASE1 repo structure, PHASE2 schemas, PHASE3 engine, PHASE4 events, PHASE5 API+WS, PHASE6 UI shell, PHASE7 Phaser, PHASE8-10 render world/net/packets, PHASE11 inspector, PHASE12 runner, PHASE13 metrics LAB, PHASE14 earthquake polish.
