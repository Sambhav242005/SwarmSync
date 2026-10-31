# SwarmSync agent instructions

## Scope and documentation

Build the synthetic research simulator and venue-neutral manuscript described in [current scope](docs/RESEARCH-COMPLETION-PLAN.md). Follow [SPEC](docs/SPEC.md), [DESIGN](docs/DESIGN.md) and [TODO](docs/TODO.md). Historical plans and dated research references are not execution instructions. Keep project Markdown under `docs/`, except README.md and AGENTS.md. Update affected links when moving documentation. Do not claim real sensing, hardware/security/privacy or field performance from synthetic results.

## Worker routing

When the user invokes routing-harness or authorizes delegation, use Luna for routing/simple work and Terra for implementation/advisor work. Do not dispatch Sol or Astra. Keep the user's selected lead unchanged. Respect the host's concurrency limit (currently three subagents plus lead), assign nonoverlapping write ownership and keep integration with the lead. Use a separate Terra advisor for substantial-change review. Report requested settings separately from observed settings; unavailable metrics remain unavailable.

## Completion evidence and TODO maintenance

After each worker assignment or wave, and whenever the user requests a status check:

- State what each worker delivered, exact files, actual checks and outcomes, blockers and remaining scope.
- The lead must inspect the source/diff and acceptance evidence, then independently run or verify meaningful checks. A worker success report alone does not establish completion.
- Update `docs/TODO.md` with evidence-backed status before reporting completion. Mark a broad task complete only when all its acceptance criteria pass. When work is partial, leave its parent unchecked and add narrowly scoped checked subtasks plus explicit remaining work.
- Record verification commands, outcomes and evidence in `docs/`; distinguish unit checks, integration checks, production builds and browser/accessibility checks. Do not imply one proves another.
- Ensure new tests are included in normal discovery, or document and run their explicit configurations until discovery is fixed. Failed or missing acceptance checks block acceptance.
- Keep documentation consistent with implemented behavior. Record known placeholders and limitations such as incomplete policies, checkpoint-only history or unverified UI workflows.
- Maintain the append-only routing ledger during activated routing-harness work. Report consultation/assignment counts and unavailable usage honestly. Do not count self-review as independent advice.

## Failures become regression tests

For every observed code or workflow failure, record the reproduction, expected result and actual result, then create a meaningful regression test at the lowest level that reproduces the real defect. Confirm the test fails against the unfixed behavior, apply the fix, and rerun it plus affected checks. Cross-route failures require real HTTP verification; imported route-handler tests alone do not prove deployed route ownership. Visual/interaction failures need appropriate browser reproduction and regression coverage rather than assertions that merely mirror CSS or text.

If automation is unavailable or the failure cannot yet be reproduced reliably, keep an explicit pending regression-test task and a repeatable manual case; never claim a test exists or passes. Distinguish product defects from tooling/environment failures. Do not manufacture product tests for unavailable tools. Group cases that share one proven cause without losing distinct failing scenarios.

Use a smaller worker (Luna) for bounded fixes when requested or supported by clear evidence. The lead monitors progress, reviews the actual diff and regression evidence, and independently reruns meaningful checks before accepting the fix. Escalate implementation failures or excessive complexity to Terra; do not repeat the same failed approach indefinitely. Update TODO and the evidence record with the failure, test, fix, retest and remaining limitations.

## Visual and interaction verification

For changes affecting the viewer, apply the installed `premium-app-ux` and `ui-ux-pro-max` skills. Use the former for complete journeys, feedback, continuity and recovery; use the latter for layout, component states, responsive behavior and accessibility. Preserve the existing product identity and scope. If a skill is unavailable, report the limitation and follow the verification requirements below.

- Run the current source and exercise the affected journey in an actual browser. Typecheck, build and unit tests alone do not verify the visual experience.
- Follow [the visual testing protocol](docs/visual-testing.md). Inspect desktop and mobile layouts, meaningful loading/empty/error states, keyboard/focus, contrast and reduced motion where applicable.
- Record actual steps and outcomes for create/play/pause/step/speed/reset, selection and relevant recovery. Check that pending actions cannot duplicate commands, context is preserved where intended, and unsupported research/replay capabilities are labeled honestly.
- Capture screenshots for changed visual states, including viewport and source revision or exact working-tree description. Inspect captures for clipping, overlap, unreadable text and misleading state. Screenshots alone cannot prove behavior, persistence, recovery or accessibility.
- Save evidence under `docs/visual-testing/` and update TODO with passed, failed and untested cases. A visual/browser acceptance task stays unchecked until its required runtime checks pass; disclose any tooling blocker instead of inventing observations.

## Current library documentation (Context7)

Use Context7 MCP whenever a task involves library, framework, SDK, API, CLI or cloud-service documentation, syntax, configuration, migration, setup or library-specific debugging. Start with `resolve-library-id` unless an exact `/org/project` ID is supplied, select the most relevant reputable match, then use `query-docs` scoped to one concept per call. Prefer Context7 over web search. If unavailable, disclose that limitation and use an appropriate supported documentation fallback; do not invent tool results or APIs.

Context7 is not required for refactoring, scripts written from scratch, business-logic debugging, code review or general programming concepts. Read relevant local skill instructions when applying a skill.
