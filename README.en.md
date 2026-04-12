# PersonBlog

<div align="center">

### A personal site repository for identity, writing, tools, experiments, and future projects

[中文](./README.zh-CN.md) | [English](./README.en.md)

</div>

---

## Quick Answer

### Do I need to run anything inside `deploy/` for local development?

No.

`deploy/` is only for server deployment and production sync.  
For local development, this is usually enough:

```bash
git clone <your-repo-url>
cd personblog
cp .env.example .env
npm install
npm run dev
```

Default URLs:

- Frontend: `http://localhost:3000`
- Admin: `http://localhost:3000/admin-login`

### What do `site/server.js`, `site/public/`, and `site/content/` do?

- `site/server.js`
  Server entry. Starts the app, handles APIs, admin auth, and content loading/saving.
- `site/public/`
  Web layer. Frontend pages, admin pages, styles, and frontend scripts.
- `site/content/`
  Default content seeds. Production runtime content is stored in `storage/`, not here.

---

## Top-Level Structure

```text
personblog/
├─ site/         current main site
├─ extensions/   future tools / projects / experiments
├─ deploy/       server deployment and sync
├─ workflow/     AI collaboration workflow
└─ storage/      runtime data (generated in production, not tracked)
```

## Structure Graph

```mermaid
flowchart TB
    A["PersonBlog Repository"] --> B["site/"]
    A --> C["extensions/"]
    A --> D["deploy/"]
    A --> E["workflow/"]

    B --> B1["server.js<br/>server entry"]
    B --> B2["public/<br/>frontend / admin / styles / scripts"]
    B --> B3["content/<br/>default content seeds"]

    C --> C1["tools/<br/>lightweight utilities"]
    C --> C2["projects/<br/>standalone projects"]
    C --> C3["lab/<br/>prototypes"]

    D --> D1["Nginx config"]
    D --> D2["PM2 / systemd"]
    D --> D3["GitHub auto-sync"]

    E --> E1["agent.md"]
    E --> E2["memory/"]
    E --> E3["scripts/"]
    E --> E4["docs/"]
```

---

## AI Workflow

### Start Task

```bash
npm run ai:start -- "task summary"
```

### Print Context

```bash
npm run ai:context
```

### Finish Task

```bash
npm run ai:finish -- "completed summary"
```

## Workflow Graph

```mermaid
flowchart TB
    subgraph L["Local Setup"]
        L1["git clone"]
        L2["cd personblog"]
        L3["cp .env.example .env"]
        L4["npm install"]
        L5["npm run dev"]
    end

    subgraph W["AI Collaboration"]
        W1["npm run ai:start"]
        W2["Read AGENTS.md and workflow/*"]
        W3["Implement changes"]
        W4["npm run check"]
        W5["npm run ai:finish"]
    end

    subgraph P["Publish"]
        P1["git add / commit / push"]
        P2["GitHub main updated"]
        P3["Server auto-sync"]
    end

    L1 --> L2 --> L3 --> L4 --> L5
    L5 --> W1 --> W2 --> W3 --> W4 --> W5
    W5 --> P1 --> P2 --> P3
```

---

## Deployment

See:

- [DEPLOY.md](./DEPLOY.md)
- [deploy/](./deploy)

---

## License

[MIT](./LICENSE)
