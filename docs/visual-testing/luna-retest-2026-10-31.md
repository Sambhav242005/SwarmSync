# Luna browser retest — 31 October 2026

## Environment

- Target: current SwarmSync viewer at `http://127.0.0.1:3000/`.
- Browser: Brave extension browser via Codex computer-use, new task tab `1007001111`.
- Source: commit `ca4e38b`, dirty working tree at retest; no app or server changes made by this worker.
- Requested model setting: Luna/high. Observed model telemetry unavailable.

## Result

Retest blocked before the interaction sequence. The page loaded and the initial browser snapshot showed status `Creating demo`, disabled Play/Step/Reset/speed controls, and `Waiting for topology…`. No `unknown simulation` error was visible in that snapshot. The next browser-state call returned `aborted before dispatch`; computer-use interruption guidance required stopping further UI input. Therefore create settling and all requested controls remain unverified in this retest; no action was sent to Play, Pause, Step, speed, Reset, or selection controls.

| Case | Retest result |
|---|---|
| Create settles | Untested: only pending `Creating demo` state observed before interruption. |
| Play / time advances | Untested. |
| Pause settles | Untested. |
| Step while paused | Untested. |
| Change to 2× | Untested. |
| Reset and clear selection | Untested. |
| Device/event selection | Untested. |
| `unknown simulation` or other errors | None visible in the one captured initial snapshot; no follow-up request/console result available. |

A desktop screenshot was returned by the browser tool and inspected at its default viewport; no responsive viewport override was available in this browser surface. Screenshot data was returned in-memory only and could not be saved under `docs/visual-testing/` through a supported file-save API. No mobile inspection was completed.

This report records only browser observations. Lead-provided HTTP and unit verification is tracked separately and does not substitute for this blocked browser retest.

## Fresh retest after interrupted attempt — assignment visual-retest-02

### Environment and evidence limits

- Target: `http://127.0.0.1:3000/`, current local server; no server startup/shutdown or app edits by this worker.
- Browser: Brave extension browser, new tab `1007001113`. Source remained commit `ca4e38b` with a dirty working tree (including the session-store fix and API regression coverage); no source files were changed here.
- Requested model setting: Luna/high. Observed model telemetry unavailable.
- Desktop screenshots were returned by the browser tool and visually inspected at its default viewport (1874 × 929 image). This browser surface did not expose a viewport override, so mobile dimensions were not tested. Screenshot output was in-memory only; no supported local file-save mechanism was available. Browser console and request logs were not exposed in this tool session.

### Observed interaction sequence

1. Opened a fresh tab. Creation settled to `Paused`, 6 agents, 6/6 devices online, 0.0 s, and “No events yet”; controls became enabled. No `unknown simulation` error appeared.
2. Clicked Play. Immediate status became `Playing` at 0.0 s. A following snapshot showed 4.0 s and populated events through `evt_50` (at 4.00 s).
3. Clicked Pause. The result showed `Paused` at 7.0 s with events through `evt_85`; a subsequent snapshot had no accessibility-tree change and the time remained 7.0 s.
4. Clicked Step while paused. Time changed exactly 7.0 → 7.5 s; recent events were added at 7.50 s through `evt_93`.
5. Selected 2×. The speed control changed to selected (`Value: 1`). With the demo reset to 0.0 later, Play at 2× followed by an explicit 1000 ms wait showed 2.0 s and `Playing`. This is one UI timing observation, not a calibrated speed benchmark. Pause then showed 8.0 s after additional interaction/capture latency; a subsequent snapshot had no accessibility-tree change.
6. Selected device `android_01`. Its inspector opened and showed 14 related events. Selected recent event `evt_93`; the inspector showed `knowledge_shared` at 7.50 s, actor `agent_e`, recipient `agent_d`, and cause `evt_82`.
7. Reset after selection and playback. Time returned to 0.0 s, status was Paused, agents were IDLE, “No events yet” returned, and the event inspector was removed. The 2× option remained selected after Reset.

### Retest results

| Case | Result |
|---|---|
| Create settles | Pass: six-device demo loaded at 0.0 s, paused, empty event list. |
| Play advances | Pass: visible status Playing and time reached 4.0 s with events. |
| Pause holds | Pass at sampled checkpoints: paused at 7.0 s and unchanged on the next snapshot. |
| Step while paused | Pass: exactly +0.5 s, to 7.5 s. |
| 2× speed | Pass for control selection; at one sample, 2.0 s after a 1000 ms wait. Not a calibrated timing test. |
| Device/event selection | Pass: `android_01` and `evt_93` displayed matching details. |
| Reset after playback and selection | Pass for time/events/selection: returned to 0.0 s, no events, inspector closed. The 2× selection persisted. |
| Unknown simulation / visible failures | None observed in this browser retest. Console and network logs were unavailable here. |
| Desktop/mobile screenshots | Desktop captured and inspected at default browser dimensions. Mobile untested because this browser surface lacked a viewport override. Screenshot files were not persisted. |

This supersedes the earlier interrupted result above for the current retest. It does not replace lead-run HTTP/unit checks or establish production-browser behavior.
