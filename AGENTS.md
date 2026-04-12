# Repository Agent Protocol

## Required Read Order

Before making any change, read these files in order:

1. `agent.md`
2. `memory/current-task.md`
3. `memory/project-memory.md`
4. `memory/work-log.md`
5. `docs/ARCHITECTURE.md`
6. `docs/ROADMAP.md`

## Operating Rules

- Use Chinese for user-facing communication unless explicitly asked otherwise.
- Treat GitHub `main` as the source of truth.
- Keep runtime data out of the repository. Do not write secrets or production data back into git-tracked files.
- Prefer extending `/tools`, `/projects`, or `/lab` instead of overloading the homepage.
- Keep structure, naming, and deployment conventions consistent with existing docs.

## Start Procedure

When a new task begins:

1. Run:
   `npm run ai:start -- "task summary"`
2. Read the required files listed above.
3. If needed, run:
   `npm run ai:context`
4. Inspect the current code before editing.

## Finish Procedure

Before handing off a completed task:

1. Run validation commands needed for the change.
2. Run:
   `npm run ai:finish -- "completed summary"`
3. If structure, deployment, or workflow changed, update:
   - `docs/ARCHITECTURE.md`
   - `docs/ROADMAP.md`
   - `memory/project-memory.md`
4. Commit and push only after the repository is in a runnable state.
