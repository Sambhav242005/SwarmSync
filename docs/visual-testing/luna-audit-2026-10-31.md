# Luna visual and interaction audit — 31 October 2026

## Environment

- Target: current SwarmSync web viewer, `http://localhost:3000/`.
- Server: `apps/web`, `npm run dev`; Next.js 14.2.35 reported ready.
- Browser: Codex in-app browser, tab 1. Requested desktop viewport was set to 1440 × 900 and mobile viewport to 390 × 844. Browser screenshots were visibly returned at both dimensions and inspected.
- Source: commit `ca4e38b`; the working tree was already dirty before this audit. No source files were changed by this assignment.
- Requested model setting: Luna/high. Observed model telemetry unavailable.

## Findings

1. **Blocking command failures in the dev workflow.** First entry showed `Creating demo`, then a visible `404: unknown simulation`. The “Create new demo” recovery succeeded and displayed six agents and six online devices. Subsequent Play, Step, 2× speed and Reset attempts each produced the same 404 and paused the UI. After reloading, creation succeeded; Step then succeeded once, advancing from 0.0 to 0.5 seconds and yielding 13 events. Selecting `evt_13` showed `task_started` at 0.50 s for `agent_f`; Play then failed again with 404. The server output recorded route compilations adjacent to these failures; a dev hot-reload interaction is possible, but the cause is unconfirmed. Production behavior was not tested.
2. **Inspector selection works and remains contextual.** Selected `android_01`, `agent_a`, and later event `evt_13`; selection was reflected in the inspector. Event details corresponded to the selected event. The inspector’s `Close` button removed it from the accessibility tree. Many telemetry fields display em dashes and the device/agent inspector reports no causal chain; recent count was zero before the successful Step. The viewer labels its scripted demo as not a validated research simulation and says historical world replay is unavailable.
3. **Mobile layout reflows vertically.** At 390 × 844 the HUD and controls wrapped, device cards stacked, and the inspector appeared beneath the world list. Vertical scrolling reached the inspector and recent-events section; no horizontal clipping was visible in the captured view. The inspector uses two definition-list columns and remained readable in the screenshot. Desktop at 1440 × 900 showed six cards across; opening the inspector reduced the world area to four cards per row and introduced vertical scrolling. The desktop settled view had substantial unused vertical space between the device cards and recent events.

## Case results

| Case | Result | Evidence / limit |
|---|---|---|
| First entry and pending | Failed, then recovered | Initial `Creating demo` status was visible; settled state showed 404. “Create new demo” produced a topology. |
| Play / pause | Failed / untested | Play failed twice with 404. A successful run was not established, so Pause could not be exercised. |
| Step | Mixed | Initial attempt failed with 404; after reload, Step succeeded to 0.5 s with 13 events. |
| Speed | Failed | 2× attempt returned 404. Other speed values were not tried. |
| Reset | Failed | Reset attempt returned 404. Reset clearing selection/data was not verified. |
| Device and agent selection | Passed | Selected `android_01` and `agent_a`; inspector updated. |
| Event selection | Passed | Selected `evt_13`; inspector displayed matching event, actor, status, task and time. |
| Inspector close | Passed | Close removed inspector content from the accessibility tree. |
| Recovery | Partial / failed | Creating a new demo recovered from the initial load error; command errors recurred. Error copy suggests Reset as a recovery, but Reset itself returned 404. No retry-after-uncertain-success or duplicate-command check was established. |
| Reload / return | Partial | Reload visibly showed `Creating demo`, then a fresh paused six-device demo with no prior selection or event history. No successful playback run existed to test persistence after a run. |
| Unavailable features | Passed | UI explicitly says this is a legacy scripted demo, not validated research; historical world replay is unavailable. |
| Keyboard / focus | Partial | Tab from selected `agent_a` moved to `android_02` in DOM order; a visible yellow focus ring appeared. Full keyboard-only journey, error traversal, and trap audit were not completed. |
| Contrast | Static calculation only | From checked-in CSS color tokens, calculated ratios: main text 17.29:1, hint 10.99:1, status 11.35:1, notice 11.39:1, error 11.63:1, button 11.68:1, selected button 10.67:1. These use declared CSS hex values, not browser-computed styles or an external contrast tool. |
| Zoom / reduced motion / screen reader | Untested | Ctrl-plus did not provide a verifiable 200% zoom reading; browser API offered viewport override only. Reduced-motion preference and assistive technology were unavailable. Static source has no motion rule; live playback was blocked. |
| Console / requests | Partial | Dev-server request log was available and recorded the 404s; browser-console inspection was unavailable through this browser surface. No unrelated request failures were observed in the captured server output. |

## Screenshot evidence

Desktop settled, desktop selected/error, mobile settled, mobile selected, and mobile inspector states were captured and visually inspected in the browser tool output at the stated viewport sizes. The available in-app browser interface returned in-memory screenshots but exposed no supported file-save operation. Therefore no screenshot files could be written under `docs/visual-testing/`; the report does not link to nonexistent captures. This is a remaining evidence limitation for lead review.

## Verification scope

Actual browser interaction and visual inspection only. No typecheck, unit test, build, or production-server test was run as part of this audit. The viewer acceptance remains open pending reliable command behavior and persisted screenshot files.
