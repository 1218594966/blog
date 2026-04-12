# AI Workflow

## Core Idea

Repository context should live in files, not only in chat history.

## Directory Map

- `workflow/agent.md`
  Agent protocol
- `workflow/memory/current-task.md`
  Active task status
- `workflow/memory/project-memory.md`
  Persistent project memory
- `workflow/memory/work-log.md`
  Historical task log
- `workflow/scripts/`
  Start, context, and finish commands

## Standard Flow

### 1. Start

```bash
npm run ai:start -- "task summary"
```

### 2. Load Context

```bash
npm run ai:context
```

### 3. Implement

- inspect code
- modify files
- validate changes

### 4. Finish

```bash
npm run ai:finish -- "completed summary"
```

### 5. Publish

```bash
git add .
git commit -m "your change"
git push origin main
```

## Important Limitation

This repository can define a stable read order and stable commands.

It cannot force every AI tool to automatically read those files.

The stable usage pattern is:

1. run `ai:start`
2. let the agent read the workflow files
3. implement
4. run `ai:finish`
