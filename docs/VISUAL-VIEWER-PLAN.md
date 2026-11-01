# Simple visual viewer plan

Date: 1 November 2026. Status: proposal; no implementation or visual acceptance claimed.

**Superseded direction:** The user rejected the tabletop in favor of distributed devices in an unreliable environment, editable/random placements, altitude, moving aircraft and connected worlds. The resulting standalone [connected-world prototype](prototypes/unreliable-world/swarmsync-world.html) and [verification record](visual-testing/connected-world/REPORT.md) supersede the tabletop art direction below. Research-engine integration remains pending; retain this earlier proposal as design history.

## Objective

Replace the six-card overview with one readable scene. A person should see which devices are active, select one, and understand a recorded exchange without changing tabs. Preserve the existing dark palette, teal accent and simulation controls.

This is a viewer change within [current scope](RESEARCH-COMPLETION-PLAN.md). It does not establish scientific validity or connect the research engine by itself. [SPEC](SPEC.md), [DESIGN](DESIGN.md), [TODO](TODO.md) and the [visual testing protocol](visual-testing.md) remain authoritative.

## Art direction and alternatives

Recommended: **field-station tabletop**. Six miniature phones and their holders sit on a shallow physical demonstration board. Their screens reflect agent state; selecting one brings its recorded activity into a compact panel. A subtle event overlay identifies exchanges between devices. The board represents the synthetic topology, not a surveyed rescue site.

Alternatives to choose before implementation:

1. **Field-station tabletop (recommended):** clearest connection to the six-device simulator, smallest visual scope.
2. **Small street scene:** phones near a few building models; stronger setting, but scenery can obscure devices and imply spatial facts absent from the simulator.
3. **Open equipment case:** six devices mounted in a portable case; strong physical identity, but fixed sockets communicate topology less naturally.

Use Anatomy at **Figure** scope: about 60 purposeful parts. Use Diorama's **card** composition expanded into the main workspace. Anti-Slop checks whether each detail explains the devices or supports legibility. These are complementary art directions, not a requirement to combine two rendering engines.

## Screen layout

- Header: SwarmSync, scenario, simulation time and a short legacy-demo qualification.
- Main area: the scene occupies most of the desktop width; an initially collapsed detail panel opens on selection.
- Controls directly below the scene: Play/Pause, Step, speed and Reset. Keep pending feedback adjacent and preserve existing command guards.
- Below controls: three to five recent activities with plain descriptions. Expand history on demand. No primary tabs or dashboard metric tiles.
- Mobile: scene first, controls next, selected-device details in normal document flow. An accessible device list supplies an alternative to small scene targets.

Keep labels as accessible HTML around the illustration. Selection highlights the matching object and list entry. A hover is optional; tap and keyboard provide the complete journey.

## Physical composition

Concept: six devices form a small synthetic field station; recorded activity lights the relevant device, and selecting it exposes its evidence.

Parts budget, 60 parts total:

- Ground, 8: base, inset surface, four feet, edge trim, identification plate.
- Structure, 12: six device holders and six supporting brackets.
- Devices, 30: six each of body, bezel, screen, camera inset and side key.
- Furniture, 4: two handles and two end caps that belong to the board.
- Indicators, 6: one inset activity indicator per holder.

Use four-tone solid shading, consistent bevels and restrained shadows. Start near a 45-degree azimuth and 35-degree elevation; verify all six devices remain distinguishable. Scale or adjust composition at narrow widths before reducing text. Details must remain subordinate to device state at normal size.

## What the scene is allowed to say

| Available input | Display rule |
| --- | --- |
| Device ID, tier, battery, RAM, failure flag | Device identity and factual detail; failed state includes text/icon, not only color |
| Device x/y | Stable projection of topology coordinates; any overlap adjustment must be identified as schematic and preserve original coordinates in details |
| Agent/device mapping, role and state | Resolve agents to devices; use a reviewed dictionary for readable state names |
| Event ID, timestamp, source, target, payload and causal IDs | Show a recorded event and its actual endpoints; omit unsupported fields |
| Unknown or unresolved endpoint | Retain the event in the feed; do not invent a destination |

The legacy event stream does not establish packet duration, radio coverage, delivery acknowledgement or correctness. A brief exchange highlight means “recorded sharing event”; it must not look like a measured in-flight packet. Do not add moving packets until send/receipt semantics are available. No coverage circles, rescues, confidence scores or success counters inferred from scenery or agent state.

On initial load show the latest snapshot without replaying its entire event history. Deduplicate activity by event ID within the run. Clear presentation state on reset or run change. Presentation animation must never advance simulation time or issue simulation commands. Pause stops presentation motion; reduced motion uses static highlights and readable activity text. Refresh and speed changes must not replay old highlights.

## Implementation sequence

1. **Freeze the visual and data contract.** Choose the scene; inspect actual event payloads and lifecycle behavior. Specify every state, label and event interpretation. Record missing data explicitly.
2. **Build a static scene study.** Compare desktop and 390px views with six selectable devices. Use the fixed Diorama kernel for a standalone study if suitable; do not modify its kernel or bench. Inspect the still composition before integration. Keep Anatomy as the craft reference rather than importing a second scene runtime.
3. **Integrate the viewer.** Separate static geometry, snapshot-to-display mapping and selection. Reuse current controls/API behavior. Connect the scene to real topology and events, with useful details replacing the long empty-field inspector. Verify current library documentation through Context7, or disclose and use official documentation if unavailable.
4. **Add event presentation.** Implement deduplication, endpoint resolution, selection continuity and honest activity descriptions. Establish the external-state integration supported by the selected renderer before committing to it; use a plain SVG component if the fixed illustration runtime cannot support the required contract.
5. **Verify complete journeys.** Apply premium-app-ux and ui-ux-pro-max during implementation. Exercise create, play, pause, step, speed, reset, device/event selection and recovery in a real browser. Record failures and regression evidence under docs/visual-testing/.
6. **Record the explanation.** A short video follows one recorded exchange: show devices, press Play, select the source and explain the event. End on the observed state. The story must work without a tab tour.

## Acceptance gates

- All six devices are discoverable at desktop and mobile sizes. Scene targets work by pointer, tap and keyboard with visible focus and accessible names.
- Initial, playing, paused, selected, empty, pending and error states are clear. Controls remain reachable without overlays covering them.
- Repeated snapshots create no repeated activity highlights. Unknown endpoints, reset, changed run and paused/reduced-motion behavior have focused tests.
- A failed device or missing field cannot appear as a successful observation. Readouts and motion derive from the same snapshot/event interpretation.
- Run typecheck, normally discovered tests and production build; distinguish these from browser acceptance.
- Follow the project's desktop/mobile, 200% reflow, contrast, reduced-motion and recovery protocol. Capture and inspect changed states with source revision recorded.
- Inspect the illustration at normal scale and 4×, including overlaps and contact points. Run the selected toolkit's applicable geometry/line validation. Do not claim an audit that the renderer does not support.
- Record actual performance on the available environment, including active and paused views; do not promise an unmeasured frame rate.
- Update TODO with narrow evidence-backed completion. Broader W2-VIEWER acceptance stays open until its engine ownership, research integration and other requirements pass.

## Deliberate limits

No decorative traffic loops, flying vehicles, fake sensing waves, ornamental particles or new primary tabs. No new font family is needed. The scene is a tool for reading synthetic state, so user-triggered playback and truthful activity take precedence over the skills' automatic idle-tour defaults. This plan does not authorize publication or claim implementation completion.
