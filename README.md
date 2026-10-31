# SwarmSync

SwarmSync is a simulation-based research project studying how communication and evidence-validation policies affect correct, timely disaster-response observations under unreliable connectivity and compromised-device scenarios.

## Status and scope

The existing application is a TypeScript demo, not a validated research simulator. The current milestone is a deterministic six-device simulator, research viewer, four sharing-policy comparisons, independent evaluator, and reproducible experiments and manuscript. Implementation and experimental acceptance gates remain open; earlier test/build results are historical evidence only.

Sensor reports are synthetic and must declare error, timing and correlation assumptions. Ground truth belongs only to the evaluator. Relayed copies retain provenance and do not count as independent corroboration. Simulation results do not establish real sensing accuracy, hardware security, privacy guarantees or field rescue performance.

Real Wi-Fi sensing, operational deployment, Android measurements, mandatory image datasets, model training/fine-tuning and elaborate explanatory figures are deferred.

## Local development

The application and its package lockfile live in `apps/web`; there is no root package manifest. From the repository root:

```powershell
cd apps/web
npm ci
npm run dev
```

Open the local address printed by the development server. Available validation commands, run from `apps/web`:

```powershell
npm run typecheck
npx vitest run
npm run build
```

These commands reflect the checked-in package scripts and Vitest dependency; they were not rerun during this documentation update. No external dataset, checkpoint or API credential is required by the bundled synthetic demo. See `apps/web/package.json` and `apps/web/package-lock.json` for dependencies.

## Documentation

| Document | Purpose |
|---|---|
| [Research completion plan](docs/RESEARCH-COMPLETION-PLAN.md) | Current scope and five deliverables; older roadmap retained as history |
| [Specification](docs/SPEC.md) | Required behavior and research gates |
| [Design](docs/DESIGN.md) | Target architecture and implementation decisions |
| [TODO](docs/TODO.md) | Pending work and acceptance criteria |
| [Feature inventory](docs/simulator-feature-roadmap.md) | Proposed features; not a completion report |
| [Architecture](docs/architecture.md) | Previously inspected implementation and known gaps |
| [Simulation model](docs/simulation-model.md) | Existing demo timing, networking and inference behavior |
| [Scenario format](docs/scenario-format.md) | Existing fixture/profile format |
| [Metrics](docs/metrics.md) | Existing counters and required evaluation |
| [Experiments](docs/research-experiments.md) | Synthetic study protocol and evidence requirements |

Dataset, Android and literature notes in `docs/` remain dated research references. Plans in `docs/superpowers/` and the Anatomy preview are historical or deferred material, not active task instructions. Where older material conflicts, the current-scope section of the research completion plan takes precedence.
