# Project Memory

## Current State

- Repository type: personal site + blog + admin + AI chat + extension hub
- Source of truth: GitHub `main`
- Production sync: server auto-syncs from GitHub
- Runtime storage: `storage/`

## Current Structure

- Main site:
  - `site/`
- Future extensions:
  - `extensions/tools/`
  - `extensions/projects/`
  - `extensions/lab/`
- AI workflow:
  - `workflow/`

## Working Rules

- Keep user-facing output in Chinese by default.
- Prefer extending `extensions/` instead of overloading the homepage.
- Update workflow memory after major tasks.

## Last Task

<!-- LAST_TASK_START -->
- Date: 2026-04-12
- Summary: 完成目录结构重组
<!-- LAST_TASK_END -->

## Next Recommended Step

- split `site/server.js`
- split frontend scripts under `site/public/assets/`
- add the first real feature page under `extensions/tools/` or `extensions/lab/`
