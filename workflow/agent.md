# Agent Operating Context

## Repository Layout

- `site/`
  Main website code
- `extensions/`
  Future tools, projects, and experiments
- `deploy/`
  Deployment and server automation
- `workflow/`
  AI operating context, memory, and workflow scripts

## Required Context

Read before implementation:

1. `workflow/memory/current-task.md`
2. `workflow/memory/project-memory.md`
3. `workflow/memory/work-log.md`

Read when structure or planning is involved:

4. `workflow/docs/ARCHITECTURE.md`
5. `workflow/docs/ROADMAP.md`

## Rules

- Default to Chinese for user-facing output.
- Treat GitHub `main` as the source of truth.
- Do not write runtime secrets or production data into tracked files.
- Prefer placing new functionality into `extensions/tools`, `extensions/projects`, or `extensions/lab`.
- Keep the homepage focused on navigation and brand expression.

## Task Lifecycle

### Start

```bash
npm run ai:start -- "task summary"
```

### Work

1. load context
2. inspect code
3. implement
4. validate

### Finish

```bash
npm run ai:finish -- "completed summary"
```

Effects:

- updates `workflow/memory/current-task.md`
- updates `workflow/memory/project-memory.md`
- appends to `workflow/memory/work-log.md`
