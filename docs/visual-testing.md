# Visual and interaction testing

Status: required protocol; not executed. Added 31 October 2026 using premium-app-ux and ui-ux-pro-max. Existing source/type/unit checks are not visual verification.

## Target and setup

Target the current SwarmSync web viewer. Start the application from `apps/web` using the checked-in development script and open its printed local URL in an available browser. Record the command, browser, URL, date, commit plus uncommitted changes, and any console/request errors. Do not substitute an older running build. Preserve the existing visual identity; this protocol does not authorize unrelated redesign.

## Required cases

| Case | Actions and evidence | Pass criteria |
|---|---|---|
| First entry | Load a new demo and capture its settled state | Loading resolves, world/controls/status are legible; legacy limitations visible |
| Play and pause | Play, observe time advancing, pause and observe again | UI feedback matches actual operation; no continued advancement after settled pause |
| Step and speed | Step while paused; compare playback at supported speeds | Expected state/time changes; no duplicate commands or misleading speed state |
| Selection | Select device, agent and event; close inspector | Selection is visible and content corresponds to selected item; focus remains usable |
| Reset | Reset after playback and selection | Consequences are clear; stale selection/data do not masquerade as new state |
| Pending/empty | Observe real loading and a valid empty event/selection state | Clear status/next action; no invented telemetry or fake success |
| Recovery | In a local test, interrupt an actual API operation, then use available recovery | Useful error, truthful preserved-state message, no silent retry duplicates; normal flow can resume |
| Unavailable features | Inspect historical/research controls and labels | Unsupported behavior is explicit and cannot imply validated research results |
| Return | Reload/reopen after a run | Actual session behavior is clearly represented; do not claim persistence that does not exist |

For each case record: trigger -> immediate feedback -> pending work -> result -> next action -> recovery, omitting stages that do not apply. Mark any unsuccessful or unavailable case failed/untested with a reason.

## Visual and accessibility inspection

- Capture at desktop (1440 x 900) and mobile (390 x 844), plus any breakpoint that exposes a defect. Record actual dimensions and zoom; check 200% zoom/reflow.
- Inspect spacing/type hierarchy, consistent component states and labels, readable colors, control target sizes, clipping, overflow, overlapping content and inspector/timeline usability. Keep existing typography and color tokens unless a change is needed to fix an observed issue; no new fonts are required by testing.
- Use keyboard-only navigation through controls, selection, errors and inspector close. Check visible focus, sensible order, no traps and accessible names/disabled states.
- Check status/error announcements with available accessibility tooling; distinguish DOM inspection from an actual screen-reader check. Inspect contrast using computed foreground/background values and a contrast tool; do not judge compliance from a screenshot alone.
- Exercise reduced-motion preferences when animation exists; check meaning is not conveyed only through color or movement. Test themes only if supported.
- Review browser console and failed requests. Distinguish an intentional recovery-test failure from an unexpected defect.

## Evidence and acceptance

Store reports and useful screenshots under `docs/visual-testing/` with relative links. Name captures by journey, state and viewport. For changed flows capture before/after when practical. Each report must list environment/source, actions, expected versus observed result, screenshots, findings with user consequence, and untested cases. Do not store secrets or unrelated browser content.

A screenshot establishes appearance only. Record interaction observations separately. Use focused automation for consequential state preservation and duplicate prevention when warranted, rather than tests that merely mirror CSS or wording. Lead reviews evidence before checking [TODO](TODO.md) acceptance. If runtime tools are unavailable, static review may continue, but visual/browser tasks stay open.
