# 项目 AI 协作说明

这个文件是给你和 AI 开发助手共同使用的固定上下文入口。

## 项目定位

这是一个“个人主页 + Blog + 后台编辑 + AI 对话 + 后续扩展入口”的网站项目。

当前目标不只是把首页做好，而是把它做成你未来所有功能和项目的总入口。

## 当前已完成

- 主站、后台、留言、AI 对话区已上线
- GitHub 已作为代码真源
- 服务器已能自动跟随 GitHub 更新
- 已有 `/tools`、`/projects`、`/lab` 三个扩展入口

## 默认协作规则

每次开始任务前，AI 应优先读取：

1. 本文件 `agent.md`
2. `memory/project-memory.md`
3. `memory/work-log.md`

必要时再看：

4. `docs/ARCHITECTURE.md`
5. `docs/ROADMAP.md`

## 代码和发布约定

- GitHub `main` 是当前真源。
- 服务器会自动同步 `main`，所以推送前要尽量保证可运行。
- 运行时数据在 `storage/`，不要把线上私密数据写回仓库。
- 能做成通用模板的内容，尽量不要写死个人域名或敏感信息。

## 每次任务结束后

完成任务后，建议执行：

```bash
npm run ai:checkpoint -- "本次完成了什么"
```

这会做两件事：

1. 更新 `memory/project-memory.md` 里的最近一次工作摘要
2. 追加一条到 `memory/work-log.md`

## 面向未来的扩展思路

- `/tools`
  放轻量工具
- `/projects`
  放完整项目
- `/lab`
  放实验原型

主站继续做品牌表达和导航，不要把所有新东西都堆进首页。
