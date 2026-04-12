# Architecture

## Top-Level Structure

- `site/`
  Current main website
- `extensions/`
  Future tools, projects, and experiments
- `deploy/`
  Server deployment and sync
- `workflow/`
  AI operating context and memory

## Site Layer

- `site/server.js`
  Express entry
- `site/public/`
  Frontend pages, admin pages, assets
- `site/content/`
  Default content seeds

## Extension Layer

- `extensions/tools/`
  Lightweight utilities
- `extensions/projects/`
  Larger standalone projects
- `extensions/lab/`
  Prototypes and experiments

## Runtime Layer

- `storage/`
  Runtime content, messages, AI private config

This folder is not tracked in git and should remain separate from repository defaults.
