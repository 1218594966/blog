# AI 协作入口

如果你是接手这个仓库的 AI 编码助手，请先阅读以下文件，再开始任何修改：

1. `agent.md`
2. `memory/project-memory.md`
3. `memory/work-log.md`
4. `docs/ARCHITECTURE.md`
5. `docs/ROADMAP.md`

默认工作方式：

- 使用中文沟通。
- 先理解项目当前结构和最近一次工作记录，再开始修改。
- 完成任务后，运行：

```bash
npm run ai:checkpoint -- "本次修改摘要"
```

如果修改涉及结构、部署或新的约定，请同步更新：

- `memory/project-memory.md`
- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`

这个仓库的 GitHub `main` 是当前真源，服务器会自动同步 `main` 的更新。
