# Viewer polish and project page — 1 November 2026

## Scope and source

Lead performed the work directly; no workers or independent advisor were used. Source: working tree based on `0819a0a`, with viewer polish, static project page and workflows described below. Existing package script and Vitest discovery edits were present before this task; inspected and exercised as CI prerequisites. No research-engine behavior was changed.

Applied unslop by Damir Sokolovsky (@heydamir), CC BY 4.0, plus premium-app-ux and ui-ux-pro-max. Modern Web Guidance `css` informed tokens and scoped hover states. Context7 tools were unavailable; official Next.js static-export and GitHub Pages custom-workflow docs were consulted instead. User requested GitHub Pages hosting, so the existing repository remains the deployment source rather than Sites hosting.

## Audit and direction

Light polish: preserve dark palette, feature set and section order.

- Header: uppercase tracked product name and bold uppercase demo badge compete with telemetry.
- Controls: every button has similar emphasis; speed controls are not visually grouped.
- Warning: full-width brown surface dominates the product content.
- Devices: cramped padding and equally emphasized device/agent buttons obscure hierarchy.
- Inspector: uncompiled utility class names leave field labels/values without dependable row alignment.
- Layout: six cards spread across one desktop row, leaving excessive unused space below.

Product: a scripted swarm demo for inspecting devices and recorded events.
Character: precise, restrained, technical.
World: a research instrument panel.
Moments: device state and the event record.
Signature: monospaced identifiers and simulation time.

## Nine passes

1. Spacing: 8/12/16/20/24/32px rhythm; consistent card padding and control heights.
2. Color: retained blue-black/teal identity, neutralized warning surface, off-white primary action.
3. Icons: no emoji or decorative icons were present; none added.
4. Copy: sentence-case product/demo/inspector labels and shorter step label; base-time meaning preserved.
5. Type: system UI retained; 400–600 weights and monospaced IDs/time with tabular telemetry.
6. Layout: retained header, notice, status, controls, devices/inspector, events order; three-column desktop device grid and responsive stacks.
7. Details: 8px controls/12px cards, quiet selected states, aligned inspector field rows and event columns.
8. Visuals: actual device data remains the content; no generated image or invented results.
9. Motion: named 140ms color transitions only, disabled under reduced-motion preference.

Exact changed viewer files: `apps/web/app/globals.css`, `apps/web/components/Controls.tsx`, `apps/web/components/Hud.tsx`, `apps/web/components/Inspector.tsx`.

## Runtime observations

Brave, local Next.js 14.2.35. Inspected viewer screenshot at 1440×900: no visible overlap or horizontal clipping, device grid and inspector readable. [Persisted desktop selection](unslop-desktop-2026-11-01.png).

- Initial create -> creating status/disabled controls -> six devices, six agents and paused at 0.0s.
- Step -> controls disabled while pending -> 0.5s and recorded events, agents PERCEIVE.
- Play -> Playing/Pause action -> logical time advanced to 3.0s; Pause stopped playback.
- Speed 2× -> pressed state changed; device selection -> selected android_01 and related events in inspector.
- Reset -> pending -> time 0.0s and inspector closed. Reload -> fresh demo rather than persistence. Production retest confirmed create, step, selection and reset to 0.0s.
- Keyboard: Tab from Play reached Step; computed visible solid outline. Full focus order, inspector close, agent/event selection and screen-reader behavior were not reverified in this pass.
- DOM overflow at 1440px was false. Requested 390×844 viewport override repeatedly returned 1440×900 for the viewer, and project page remained 1874px; mobile checks remain untested. No mobile screenshot is claimed.
- Loading/error-state captures, API interruption recovery, pending duplicate-click stress, 200% zoom and runtime reduced motion remain untested. CSS includes reduced-motion handling; source inspection is not runtime proof.
- Computed viewer text roles: primary #eef4f5, secondary #c0cecf, muted #a3b2b5; primary button foreground #10191e/background #eef4f5. Complete contrast audit remains pending.

### Tooling failure and repeatable recovery

Running `next build` alongside `next dev` sharing `.next` caused missing-chunk/module errors and a blank/500 preview. Expected: a usable preview; actual: missing `276.js`/`_document` errors. Stopped both servers, rebuilt with no dev writer, then started production server; create/step/reset and HTTP smoke passed. This was an agent-induced build-directory collision, not a demonstrated product defect. Do not run dev/build concurrently in one checkout. No product regression test was manufactured; this manual tooling case is recorded for future verification. Browser console retained historical collision errors; no clean-console claim is made.

## Project page and workflow

User reference inspected in Brave: [Weighted Lowrank Compression](https://sambhav242005.github.io/Weighted-Lowrank-Compression/). SwarmSync page uses the same academic reading direction: white background, serif text, centered title/author/date, section navigation, abstract, policy descriptions, current acceptance status and evidence links. The six-device diagram is explicitly conceptual. No comparative findings or paper PDF were fabricated.

Files: `docs/site/index.html`, `docs/site/styles.css`, `docs/site/.nojekyll`, `.github/workflows/pages.yml`, `scripts/check-project-page.py`. [Desktop project page](project-page-desktop-2026-11-01.png) inspected: title, metadata, navigation and abstract readable without overlap. Mobile inspection remains pending.

Pages uploads `docs/site` directly. It does not attempt to statically export server mutation routes. Workflow checks local asset/anchor integrity on PRs and pushes, with deployment restricted to main and pages/id-token permissions scoped to deployment. Existing `.github/workflows/ci.yml` separately validates the server app under `apps/web`.

Official references: [GitHub Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports). GitHub Pages configuration read returned build_type=workflow and expected URL https://sambhav242005.github.io/SwarmSync/.

## Actual checks

- `npm run typecheck` in apps/web: passed.
- `npm test`: 25 tests across five files passed, including research suites under existing discovery edits.
- `npm run build`: passed; repeated after resolving shared-output collision; server mutation routes remain dynamic.
- `node scripts/simulation-http-smoke.mjs http://localhost:3000`: all create/state/topology/start/step/speed/pause/reset/events/metrics calls 200; unknown ID 404; PASS.
- `python scripts/check-project-page.py`: local assets, anchors, duplicate IDs and project-relative paths passed.
- Python `yaml.safe_load` on both workflow files: parsed successfully (syntax check, not hosted execution).
- GitHub action tag API: checkout v6, setup-node v7 and deploy-pages v4 exist; Pages versions follow current official example.

Broad VIS/P3/research acceptance remains open. Deployment execution will be recorded separately after publishing.

## Hosted acceptance

Published source revision `c74aa97` to main. [Pages run 41231961059](https://github.com/Sambhav242005/SwarmSync/actions/runs/41231961059) succeeded (build 16s, deploy 16s). [CI run 41231960955](https://github.com/Sambhav242005/SwarmSync/actions/runs/41231960955) succeeded (41s): install, typecheck, unit tests, production build and production HTTP smoke.

Lead opened https://sambhav242005.github.io/SwarmSync/ in Brave, verified the academic title/abstract/navigation/status and inspected [live screenshot](project-page-live-2026-11-01.png), actual viewport 1874px wide. Hosted page shows current source rather than a missing-page response. Deployment emitted nonfatal upstream action Node-runtime and ubuntu-latest migration notices; no action step failed. No public interactive simulator hosting is claimed.
