# SwarmSync simulator: feature inventory and skills

Updated: 31 October 2026.

Status: consolidated discussion document. Features below are proposed unless explicitly described as existing. This is not an implementation-completion checklist or a frozen experimental protocol.

Related: [current research scope](RESEARCH-COMPLETION-PLAN.md), [existing specification](SPEC.md), [existing design](DESIGN.md), and [existing TODO](TODO.md). The latter three were reconciled to the reduced synthetic-study scope on 31 October 2026. This inventory still includes candidate extensions; it does not make them mandatory.

## 1. Purpose and boundaries

Build a research simulator and manuscript investigating how device placement, communication policies, unreliable connectivity, and potentially compromised devices affect correct, timely disaster-response reporting.

The simulator should let a researcher construct an environment, arrange devices, choose exchange behavior, generate observations, inspect message histories, and compare reproducible experiments.

- Initial reference size: six devices.
- Communication and coordination remain the central study. Environment and security extensions must serve an explicit hypothesis.
- No operational rescue deployment, police/government integration, real malware execution, or real human tracking.
- Wi-Fi sensing, if represented, initially means a synthetic observation model. Radio-link simulation does not establish human-presence detection accuracy.
- Simulation access controls do not prove protection against administrator-level compromise or misuse by an authority controlling the system.
- Real model training, coordinator fine-tuning, hardware measurements, and physical sandbox validation are deferred.
- Novelty and publishability are not established. Expand related work into delay-tolerant networking, opportunistic routing, and deadline-constrained delivery before making novelty claims.

## 2. Main workspace and interaction

### Network first

- Main view shows devices as nodes, communication links, message movement, partitions, and failures within the selected environment.
- Clicking a node opens its inspector. The Anatomy device cutaway belongs here, not in place of the network.
- Closing the inspector preserves the network viewport, selected time, and experiment context.
- Left panel: environment controls, node palette, radio and exchange presets.
- Centre: network map with placement and movement tools.
- Right panel: selected node, link, or message inspector.
- Bottom: timeline, event log, playback controls, and experiment results.

### Reader and writer workspace modes

| Mode | Intended behavior |
| --- | --- |
| Reader / Observe | Inspect, pause, replay, follow messages, view assumptions, and compare results without altering the recorded experiment. |
| Writer / Build | Add/move devices, configure links and roles, compose workloads, and schedule failures or movement. |

These are workspace modes, distinct from node sender/receiver roles. They are not a claim of production-grade user authorization.

- Include undo/redo for scenario editing and clear pending/error states.
- Editing a completed experiment creates a scenario branch/version; original artifacts remain immutable.
- Changes during an interactive run must become timestamped commands/events rather than silently rewriting history.
- Provide keyboard controls, visible focus, accessible status, readable contrast, mobile layouts, and reduced-motion behavior.

## 3. Nodes and placement

- Roles: sender, receiver, both, relay, broker, and gateway. Roles describe behavior; permissions describe permitted actions.
- Per-node configuration: interfaces, processing profile, memory budget, queue capacity, power/battery assumptions, and observation-generation settings.
- Drag nodes horizontally; separately adjust ground elevation and antenna height above ground.
- Show distance measurements, terrain profiles, and estimated coverage. Avoid presenting a simple coverage circle as proof of connectivity.
- Define movement routes, speed, stops, and elevation changes; preserve trajectories in recorded inputs.
- Support stationary sensors, moving responders, coordinators, and gateways as scenario roles.
- Distinguish power failure, processing failure, radio disconnection, and application-service failure.

## 4. Separate communication layers

MQTT is an application messaging protocol; Wi-Fi and Bluetooth represent different underlying communication technologies. Do not offer them as interchangeable choices at one layer.

| Preset | Exchange to illustrate | Example use case |
| --- | --- | --- |
| Direct messages over a modeled Wi-Fi link | Sender to receiver with explicit delivery/retry behavior | Responder reports to a coordinator. |
| MQTT over Wi-Fi/IP | Publisher to broker to subscribed receivers | Sensors publish observations by rescue zone. |
| Bluetooth LE sensor link | Sensor exchanges observations with a nearby gateway | Wearable or local sensor reports to a responder device. |
| Bluetooth Mesh | Group-addressed exchange through configured relay behavior | Distributed sensors exchange alerts. |
| Store-and-forward policy | Retain eligible reports until a connection becomes available | Moving responder bridges disconnected groups. |

- Define the specific modeled Bluetooth mode; do not silently treat BLE connections and Bluetooth Mesh as equivalent.
- A gateway may receive on one interface and forward on another, with its own processing, queues, overhead, and failure behavior.
- Include discovery, connection setup, teardown, reconnection, and broker/gateway outage recovery.
- Expose only protocol options implemented by the selected model. Document omissions; do not claim full protocol conformance from a simplified simulator.
- Specify protocol-delivery guarantees separately from application correctness, deduplication, and useful on-time delivery.

## 5. Messages, packets, and workloads

### Message composer

- Sender; destination, group, or topic; intended recipients.
- Payload preview and actual encoded message size.
- Priority, creation time, expiry/deadline, and transmission frequency.
- Protocol-specific delivery options where modeled.
- Observation ID, original source, revision, sample/task reference, and provenance.
- Controlled synthetic faults: duplicate, stale, malformed, false, delayed, or excessive reports.

### Transport behavior

- Distinguish application messages from packets. One animation must not imply one physical packet when fragmentation occurs.
- Account for serialization, fragmentation/reassembly when supported, headers, acknowledgements, retries, and duplicate traffic.
- Include bounded queues, admission/rejection, backpressure or explicit drops, and deadline expiry while waiting.
- Represent shared airtime, competing senders, channel contention, and interference at the chosen fidelity level.
- Define failure and retry behavior explicitly; retries consume time and resources.
- Preserve original provenance through all relays. Five copies of one observation remain one evidence source.

### Workload controls

- Specify which nodes generate observations, their rates, sizes, recipients, task classes, and deadlines.
- Support a single manual message, periodic traffic, and reproducible workload traces.
- Keep workloads fixed across policy comparisons.

## 6. Natural and built environments

Environments must change documented model inputs, not only scenery.

| Environment | Effects to represent | Example experiment |
| --- | --- | --- |
| Open field | Reference distance/elevation conditions with minimal obstruction | Establish a baseline for identical devices and workloads. |
| Mountain / valley | Terrain profile, direct-path obstruction, diffraction where supported | Move a relay onto a ridge and compare delivery. |
| Coast / ocean | Direct and water-reflected paths; antenna height; optional time-varying surface assumptions | Compare shore-to-shore and shore-to-boat links. |
| Forest | Vegetation depth/density and frequency-dependent additional loss | Move a node from forest into a clearing. |
| Indoor building | Rooms, walls, material assumptions, gateways, obstruction | Compare placements across rooms and corridors. |
| Damaged urban block | Buildings, debris, infrastructure failure, network partitions | Route observations around a blocked street. |
| Moving rescue team | Changing geometry and temporary encounters | Evaluate store-and-forward under scheduled movement. |
| Congested command post | Many senders sharing constrained infrastructure | Separate congestion from propagation failures. |

Moving teams and congestion are scenario overlays that can be combined with terrain environments.

### Environmental controls

- Editable elevation, hills/ridges, walls/buildings, vegetation regions, and water areas.
- Weather is a separate layer: rainfall and relevant vegetation/surface conditions, with optional wind-related movement or sea-state effects only where a model supports them.
- Frequency, transmit power, antenna height/orientation/gain, receiver sensitivity, noise/interference, and rate-selection assumptions.
- No universal weather penalty. Effects depend on frequency, path length, geometry, and the selected model.
- Do not invent direct wind or humidity penalties simply to make controls visibly change a signal.
- Advanced atmospheric effects, detailed wave dynamics, and full electromagnetic simulation are later extensions, not initial requirements.

### Causal calculation

Terrain, weather, geometry, and radio settings → modeled received signal and noise/interference → transmission success/rate → queues, retries, and application outcomes.

- Choose models within their documented frequency, distance, and geometry limits.
- Label each model as synthetic, literature-based, or calibrated to measurements; retain version, parameter provenance, uncertainty, and omissions.
- Avoid double-counting losses when combining models.
- Use a documented mapping from signal quality to packet success/rate; signal strength alone is not delivery probability.
- Preserve spatial and temporal correlation where relevant rather than independently rerolling every link at every animation frame.
- Do not claim observed coastal, mountain, or rubble performance from uncalibrated simulation.

## 7. Sensing and computation

- Keep sensing error separate from communication failure. An incorrect observation delivered successfully is different from a correct observation that never arrives.
- Synthetic sensing parameters: false positives, false negatives, uncertainty, observation age, and common environmental errors.
- Correlated observations must not automatically count as independent corroboration.
- Inference consumes scheduled time and admitted memory; results appear only on completion.
- Device profiles include provenance. Unknown energy measurements remain unavailable rather than zero.
- Ground truth remains in the evaluator, outside agents, message-selection policies, and ordinary node inspectors.

## 8. Bounded security and misuse scenarios

- Specify attacker capabilities and number of compromised nodes per experiment.
- Inject false claims, replays, duplicates, selective drops, delays, and traffic floods as simulator events.
- Model format checks, freshness, origin-based deduplication, permissions, and corroboration policies.
- Authentication in the model establishes origin, not physical truth. A compromised node can produce well-formed false data.
- Preserve conflicting evidence and uncertainty. Missing reports do not prove that no person is present.
- Optional access-policy experiments: incident-specific scope, time-limited access, minimum disclosed data, retention expiry, and recorded exceptional access.
- Model misuse by an authorized operator separately from unauthorized access.
- Measure only properties demonstrated by the model. Do not claim resistance to actual malware, sandbox escape, malicious administrators, or independent radio observers.

## 9. Inspectors and explanatory visuals

| Inspector | Required information |
| --- | --- |
| Node | Roles, interfaces, local knowledge, queues, resources, received/sent reports, and failure state. |
| Link | Endpoints, distance, terrain cross-section, radio settings, modeled losses, signal margin, congestion, and failure reason. |
| Message | Original source, payload, size, causal parents, hops, queue/transmission times, retries, checks, and final disposition. |
| Experiment | Scenario/model versions, seeds, workload, policy settings, metrics, artifacts, and limitations. |

- Show explicit causal explanations: terrain obstruction, low signal margin, busy channel, queue overflow, expired report, or unavailable broker.
- Provide a timestamped event log and playback timeline with clear live/replay modes.
- Side-by-side comparison uses identical inputs and aligned simulated time.
- Anatomy is optional explanatory art inside the node inspector. It must consume the same snapshot/events as other views when integrated.
- The existing [Anatomy preview](../previews/anatomy/index.html) is a standalone synthetic demonstration, not an integrated simulator or hardware design.
- Never depict passing validation as proof of truth or logical compartments as demonstrated security isolation.

## 10. Reproducibility and scientific evaluation

- Deterministic logical-time scheduler with stable event ordering and isolated RNG streams.
- Playback speed, polling, and animation frame rate must not change scientific results.
- Freeze workloads, movement, environmental conditions, and failure traces for paired comparisons.
- Policies: local-only diagnostic, direct delivery, full sharing, and selective sharing. Include FIFO, earliest-deadline-first, and size-based scheduling controls where applicable.
- Separate policy effects from differences in radio, workloads, perception quality, and device resources.
- Independent evaluator: correct on-time delivery per observation second, delivery coverage, incorrect acceptance, missed/late/incomplete results, latency, bytes, retries, queue drops, and memory usage.
- Security scenarios additionally report successful malicious influence, false rejection, and availability impact; define denominators before collection.
- Run multiple seeds and sensitivity sweeps. Final sample count and statistical comparisons must be justified and frozen after a separate pilot.
- Save manifest, scenario/configuration hashes, model versions, seed streams, event log, metrics, terminal status, and analysis scripts.
- Historical replay reconstructs state; it does not mutate live outcomes. Reset creates a new run identity.
- Include interrupted/failed runs in reporting and distinguish simulation variability from data/model uncertainty.
- Paper deliverables: frozen protocol, reproducible reference run, final artifacts, generated figures/tables, limitations, related work, bibliography, and venue-neutral manuscript.

## 11. Implementation priorities

### First complete experiment

1. Correct deterministic engine, private knowledge, timed transport, independent evaluator, and replay.
2. Six movable nodes; sender/receiver/relay roles; one documented radio model.
3. Open-field baseline plus a mountain obstruction and repositionable relay.
4. Direct and selective delivery, with full sharing and scheduling controls for comparison.
5. Message composer, link/message inspectors, recorded edits, and reproducible exports.
6. Run a small pilot to verify timing and placement effects before expanding scope.

### Subsequent additions

1. Coastline behavior and additional terrain/vegetation models.
2. MQTT broker behavior and outage recovery.
3. Bluetooth LE and Bluetooth Mesh as separately validated models; multi-interface gateways.
4. Movement schedules, store-and-forward, contention, and larger workload sweeps.
5. Bounded adversarial and access-misuse experiments.
6. Anatomy integration and presentation polish after correct behavior exists.

Do not implement every environment and protocol before validating one end-to-end experiment. Each added model needs hand-computable or independently reproducible acceptance cases.

## 12. Skills available for this work

This is a candidate skill map, not an instruction to invoke every skill at once. Read each selected SKILL.md before applying it. User choices and current scope take precedence over optional skill workflows.

| Skill | Intended use | Local instruction source |
| --- | --- | --- |
| routing-harness | Explicitly requested delegation, worker boundaries, independent review, acceptance evidence, and honest usage accounting | [SKILL.md](C:/Users/NPC/AppData/Roaming/skillshare/skills/routing-harness/SKILL.md) |
| implement | Implement agreed work in bounded increments, run checks, review, and commit according to the active task | [SKILL.md](C:/Users/NPC/AppData/Roaming/skillshare/skills/implement/SKILL.md) |
| tdd | Protect scheduling, transport, replay, permissions, and metric seams with behavioral tests | [SKILL.md](C:/Users/NPC/.agents/skills/tdd/SKILL.md) |
| diagnosing-bugs | Investigate determinism failures, packet accounting errors, or performance regressions | [SKILL.md](C:/Users/NPC/.agents/skills/diagnosing-bugs/SKILL.md) |
| code-review | Independent review of consequential engine/API changes and scientific invariants | [SKILL.md](C:/Users/NPC/.agents/skills/code-review/SKILL.md) |
| premium-app-ux | Complete scenario-editing, playback, recovery, inspector, and comparison journeys | [SKILL.md](C:/Users/NPC/AppData/Roaming/skillshare/skills/premium-app-ux/SKILL.md) |
| anatomy | Detailed optional selected-node cutaway and explanatory paper/demo figures | [SKILL.md](C:/Users/NPC/.agents/skills/anatomy/SKILL.md) |
| modern-web-guidance | Current browser patterns for responsive controls, accessible interactions, and motion | [SKILL.md](C:/Users/NPC/.agents/skills/modern-web-guidance/SKILL.md) |
| context7-mcp | Current documentation before framework/library/API-specific work, as required by project instructions | [SKILL.md](C:/Users/NPC/.agents/skills/context7-mcp/SKILL.md) |
| read-the-damn-docs | Verify third-party integration assumptions and supported APIs | [SKILL.md](C:/Users/NPC/.agents/skills/read-the-damn-docs/SKILL.md) |
| research | Investigate propagation models and related methods using primary sources; save evidence in the repository | [SKILL.md](C:/Users/NPC/.agents/skills/research/SKILL.md) |
| literature-search-arxiv | Targeted paper discovery; supplement with publisher/standards sources | [SKILL.md](C:/Users/NPC/.agents/skills/literature_search_arxiv/SKILL.md) |
| fact-checker | Check novelty, standards claims, reported results, and manuscript statements | [SKILL.md](C:/Users/NPC/.agents/skills/fact-checker/SKILL.md) |
| academic-paper | Manuscript planning/writing when the research question and evidence are ready; its larger agent workflow is optional to this roadmap | [SKILL.md](C:/Users/NPC/.agents/skills/academic-paper/SKILL.md) |
| archify | Explain software architecture and data flow in documentation | [SKILL.md](C:/Users/NPC/.agents/skills/archify/SKILL.md) |
| ui-demo | Record a reproducible walkthrough of scenario setup, message tracing, and policy comparison | [SKILL.md](C:/Users/NPC/.agents/skills/ui-demo/SKILL.md) |

Context7 was not exposed in the tool inventory during discussion. Confirm its availability before library-specific implementation; do not claim it was used when unavailable. A routing skill cannot supply missing token telemetry, change the lead model, or prove security/scientific validity.

## 13. Source starting points

- [MQTT overview](https://mqtt.org/): publish/subscribe messaging and broker architecture.
- [Bluetooth SIG Mesh overview](https://www.bluetooth.com/learn-about-bluetooth/topology-options/le-mesh/mesh-faq/): distinguish mesh forwarding from simple sensor links.
- [ITU-R P.1812-8](https://www.itu.int/dms_pubrec/itu-r/rec/p/R-REC-P.1812-8-202509-I%21%21PDF-E.pdf): terrain/path-specific prediction; verify applicability before selecting it.
- [ITU-R P.833](https://www.itu.int/rec/R-REC-P.833-10-202109-I/en): vegetation attenuation.
- [ITU-R P.838-3](https://www.itu.int/dms_pubrec/itu-r/rec/p/r-rec-p.838-3-200503-i%21%21pdf-e.pdf): frequency-dependent rain attenuation.
- [ITU terrestrial point-to-point propagation handbook](https://www.itu.int/dms_pub/itu-r/opb/hdb/R-HDB-54-2009-OAS-PDF-E.pdf): surface reflections and propagation mechanisms.
- [Existing related-work review](literature-review-on-device-vision.md): previous literature groundwork, not an exhaustive novelty assessment.

## 14. Decisions still open

- Final primary hypothesis and the smallest experiment that tests it.
- Exact propagation model, valid frequency/distance range, and packet-success mapping for the initial radio.
- Whether initial reader/writer labels remain as written or become Observe/Build in the interface.
- Protocol versions, modeled subsets, and compatibility limits.
- Exact environment parameters, movement traces, workload sizes, and sensor-error assumptions.
- Security experiments included in the first paper versus a follow-up.
- Final baseline settings, parameter sweeps, statistical analysis, and pilot/final seed counts.

These are design decisions to resolve through discussion and evidence before final implementation or experiment freezing.
