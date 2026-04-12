# Agent Operating Context

## Project Identity

- Type: personal site + blog + admin + AI chat + extensible hub
- Source of truth: GitHub `main`
- Deployment model: server auto-syncs from GitHub
- Runtime storage: `storage/`
- Expansion hubs:
  - `/tools`
  - `/projects`
  - `/lab`

## Primary Goal

Do not treat this repository as a one-off homepage.

The long-term goal is to keep the main site as a stable entry hub for:

- personal content
- lightweight tools
- larger projects
- experiments and prototypes

## Required Context Inputs

Always read these before implementing changes:

1. `memory/current-task.md`
2. `memory/project-memory.md`
3. `memory/work-log.md`

Read these when the task touches structure or planning:

4. `docs/ARCHITECTURE.md`
5. `docs/ROADMAP.md`

## Constraints

- Prefer Chinese content and Chinese UX copy by default.
- Do not overwrite runtime data in `storage/`.
- Do not hardcode personal secrets, private keys, or production-only values into tracked files.
- Prefer incremental structure improvements over large rewrites unless the task explicitly requires it.

## Execution Sequence

### On task start

Run:

```bash
npm run ai:start -- "task summary"
```

Then:

1. read required context
2. inspect relevant code
3. implement
4. validate

### On task finish

Run:

```bash
npm run ai:finish -- "completed summary"
```

Effects:

- updates `memory/current-task.md`
- updates the latest task block in `memory/project-memory.md`
- appends an entry to `memory/work-log.md`

## Structural Direction

- Homepage: brand, navigation, overview
- `/tools`: small reusable utilities
- `/projects`: full standalone applications
- `/lab`: prototypes, motion experiments, temporary ideas

New features should be assigned to one of these layers before implementation.
