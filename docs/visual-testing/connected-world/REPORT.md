# Connected-world prototype evidence

Date: 1 November 2026. Source base: `2471a922b4e1988afe5ef907b4bdb629693af296` plus uncommitted prototype/evidence/plan/TODO files. No production viewer or research-engine source changed.

## Deliverable

[Open the offline prototype](../../prototypes/unreliable-world/swarmsync-world.html), approximately 0.78 MB including bundled Three.js. WebGL 2 is required; no CDN or API connection is required at runtime. Four visual finishes share the same model. Default still: time zero, with the aircraft at the airfield and distributed ground nodes spanning three regions.

Settlement, mountain pass and airfield share one logical time and graph. Four ground radios, a rover and an aircraft occupy a continuous coordinate space. Links use synthetic distance, axis-aligned obstruction volumes and a scheduled outage. Breadth-first paths are actual chains of currently available model links across regions. They do not prove packet delivery. Aircraft and rover both cross all three regions.

Placement uses labeled native sliders; seeded layout generation moves ground radios across the regions. Aircraft height is 5.8–8 arbitrary units. Playback is 0.25×, 0.5×, 1×, 2× or 3×. Restart preserves placement; Restore defaults resets placement, time, speed and finish. Ground elevation can suspend a node; it is not terrain snapping. Minor trees, crates and road props do not occlude links. The scenario loops after 48 seconds and settings are not persisted across page reloads.

## Worker assignments and review

The user explicitly requested Sol, overriding earlier Luna/Terra routing preferences. Three implementation assignments and one separate independent review were requested with `gpt-6.1-sol`. The tools accepted all four assignments; independent runtime/model identity, token consumption and usage metrics were unavailable. No routing-harness ledger was activated.

| Worker | Owned source / delivery | Checks reported |
| --- | --- | --- |
| world_geometry | `docs/prototypes/unreliable-world/world.js`; continuous scenery, aircraft/rover, links, outage markers | Syntax check; final look-world report: 51 checks, all passed; desktop/mobile/pixel/outage captures inspected |
| world_model | `docs/prototypes/unreliable-world/model.mjs`, `model.test.mjs`; regions, shared obstacles, seeded placement, graph paths | 11 explicit Node tests passed |
| world_ui | `docs/prototypes/unreliable-world/app.js`, `template.html`; native controls, region/path readouts, placement warning, reset | JS syntax check; runtime acceptance left to lead |
| independent_review | Read-only review, no source ownership | Independent 11-test rerun; found cap/roof/model mismatch, altitude framing mismatch, missing offline cue and reset-finish ambiguity; fixes inspected |

Lead inspected actual source and captures, fixed packaging, built the final artifact and independently reran model and actual-page browser checks. Final evidence is not based solely on worker reports.

## Reproduction and checks

From the repository root:

```powershell
node docs/prototypes/unreliable-world/build.mjs
node --test docs/prototypes/unreliable-world/model.test.mjs
node docs/prototypes/unreliable-world/browser-check.cjs
node C:/Users/NPC/.agents/skills/diorama-worlds/scripts/look-world.mjs docs/prototypes/unreliable-world/world.js docs/visual-testing/connected-world-geometry
```

Build requires the Diorama Worlds skill installation and pinned dependencies. `DIORAMA_WORLDS_HOME` overrides its default local path. These prototype tests are **not** discovered by the application's default Vitest command; use the explicit commands above. No application production build/typecheck or scientific validation was performed in this task.

- **Lead model/artifact run:** 11/11 passed after final rebuild: parsing the actual bundled script; repeatable random placement; obstruction/elevation; outage boundaries; equal-time determinism; cross-region multihop paths; outage partitions; moving-device region crossings; aircraft height floor.
- **Actual-page Chromium run:** [interaction-report.json](interaction-report.json), all listed checks passed. Tests exercise native controls, keyboard slider adjustment, restore/restart, inside-obstacle warning and clearing it by raising the device, seeded placement, cross-region path, outage, reduced motion and mobile overflow. Measured after the harness pauses: slow trial time 0.81125 s from 0.5 s after about 1.2 wall seconds at 0.25×; fast trial time 3.1347 s after about 1 wall second at 3×. These are timing checks on this machine, not hardware benchmarks.
- **Scene harness:** [world-report.json](../connected-world-geometry/world-report.json): 51/51 passed. Includes offline load, deterministic seeks, transform seam, all finishes, mobile framing, draw/triangle budget, allocation stability, time-based playback, pause, reduced motion, offscreen/hidden suspension, disposal and unavailable-WebGL fallback. Lead checked the report's pass count and inspected its outage image. Scene checks do not establish the entire custom UI's accessibility.
- **Captures inspected:** [desktop](desktop.png), [mobile](mobile.png), [maximum aircraft height](aircraft-max-height.png), and [time-24 outage scene](../connected-world-geometry/world-miniature-half.png). Devices are small in the mobile overview; the HTML selector/readouts remain usable. No direct scene dragging/picking is implemented. Camera is fixed. This remains a functional miniature prototype, not a finished high-detail landscape.

## Failures and corrections

1. **Packaging defect:** opening the first custom HTML yielded `Unexpected identifier 'highp'` and no runtime. Expected: bundled JavaScript loads. Reproduced with the artifact parse regression (1 failed/5 passed). Cause: replacement-string interpolation changed dollar sequences in the bundle. Fixed `build.mjs` to use a replacement callback. Same regression then passed; final actual-page browser run passed.
2. **Harness selectors:** an exact accessible name omitted the output value inside its label; a subsequent partial label also matched the newly added route selector. Expected: the test locates the intended control. Fixed tests to use stable input IDs for ranges and exact labels for selectors. These were automation locator failures, not demonstrated product failures.
3. **Render allocation check:** geometry count rose 24→25 when an initially invisible link first appeared. All geometries were built initially, but lazy GPU upload violated the harness's constant-count expectation. Changed hidden links to zero opacity so initial rendering uploads them. Same seek/allocation check passed on rerun.
4. **Review corrections:** caps and roofs were moved within modeled obstruction heights; altitude capped at8 to match framing; offline radios gained rust X markers; Restore defaults now restores finish. Browser checks cover finish reset and maximum-altitude capture; the reviewed time-24 image shows the X. Source review identified these before a dedicated failing browser regression was saved. A comprehensive geometry-to-obstruction boundary regression remains pending; do not claim it exists.

## Remaining acceptance

Research-engine integration, packet queues/receipts, validated radio models, persistence, arbitrary path editing, direct object dragging, multi-tab ownership and full replay are not delivered here. The basic model assumes a flat world with solid obstruction boxes, not a terrain propagation solver. Full keyboard-only traversal, screen-reader behavior, measured contrast, 200% browser zoom and real mobile-device performance remain unverified. These keep broad viewer acceptance open in TODO.

Applied skills: Diorama Worlds (actual renderer), Diorama (composition), premium-app-ux and ui-ux-pro-max (interaction states), Modern Web Guidance (native range controls). The Worlds renderer is an experimental skill runtime, not production certification. Context7 was unavailable; local scene API and official Three.js/MDN documentation supplied the fallback. Modern Web Guidance's slider guide states: “Use a labeled `<input type="range">`”; native keyboard/touch behavior and visible values were retained instead of custom drag widgets.
