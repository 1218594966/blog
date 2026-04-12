# AI Workflow

## Workflow Goal

Make repository context persistent across AI sessions and across different AI tools.

This workflow is repository-based, not chat-history-based.

## Core Files

- `AGENTS.md`
- `agent.md`
- `memory/current-task.md`
- `memory/project-memory.md`
- `memory/work-log.md`

## Workflow Stages

### 1. Start

Command:

```bash
npm run ai:start -- "task summary"
```

What it does:

- creates or refreshes `memory/current-task.md`
- records start time
- writes current task summary
- lists the required read order for the agent

### 2. Load Context

Command:

```bash
npm run ai:context
```

What it does:

- prints the repository context bundle in a stable order
- includes current task, project memory, work log, architecture, roadmap

### 3. Implement

Expected sequence:

1. inspect relevant code
2. edit files
3. run validation
4. review resulting diff

### 4. Finish

Command:

```bash
npm run ai:finish -- "completed summary"
```

What it does:

- marks `memory/current-task.md` as completed
- updates the latest task block in `memory/project-memory.md`
- appends a timestamped record to `memory/work-log.md`

### 5. Publish

Typical sequence:

```bash
git add .
git commit -m "your change"
git push origin main
```

Server behavior:

- server follows GitHub `main`
- production sync is automatic
- runtime secrets and edited content remain outside git in `storage/`

## Practical Use With AI Tools

For tools that support `AGENTS.md`, this file acts as the repository bootstrap.

For tools that do not auto-read repository instructions, use this prompt:

```text
Read AGENTS.md, agent.md, memory/current-task.md, memory/project-memory.md, and memory/work-log.md before making changes.
```

## Current Limitation

No generic AI tool can be forced by the repository itself to read files automatically on every run.

What this repository can do is:

- provide a fixed read order
- provide start/finish commands
- keep persistent memory in versioned files

That makes handoff far more stable, even when the AI tool changes.
