# AI 工作流

## 为什么要有这套工作流

因为你后面大概率还是会借助 AI 工具继续开发，所以我们需要一套稳定的上下文方式，而不是每次都从头解释一遍项目。

这套工作流的目标是：

1. 每个 AI 一进来就知道先看什么
2. 每次任务结束后都能留下可追踪的记录
3. 让 GitHub 仓库本身就能承载上下文，而不是只靠聊天记录

## 关键文件

- `agent.md`
  你和 AI 的固定协作说明
- `AGENTS.md`
  给支持 AGENTS.md 规范的工具自动读取
- `memory/project-memory.md`
  当前项目状态、约定、下一步重点
- `memory/work-log.md`
  历史任务记录

## 推荐工作流程

### 开始任务

先让 AI 读取：

- `agent.md`
- `memory/project-memory.md`
- `memory/work-log.md`

如果要快速导出上下文，也可以运行：

```bash
npm run ai:context
```

### 完成任务

任务完成后运行：

```bash
npm run ai:checkpoint -- "本次完成了什么"
```

这个命令会：

- 更新 `memory/project-memory.md` 中的最近一次任务摘要
- 往 `memory/work-log.md` 追加一条历史记录

### 提交代码

```bash
git add .
git commit -m "你的修改说明"
git push origin main
```

推到 GitHub 后，服务器会自动同步。

## 对小白更友好的使用方式

以后你甚至可以直接把下面这句话发给 AI：

```text
先读取 agent.md、memory/project-memory.md、memory/work-log.md，再根据上下文继续修改项目。
```

如果是支持 AGENTS.md 的工具，它可能还会自动读取 `AGENTS.md`。

## 限制说明

这套机制可以把上下文组织得很清楚，但不同 AI 工具并不能保证“100% 自动读取”这些文件。

最稳的做法仍然是：

1. 把这些文件放在仓库根目录和固定位置
2. 开头明确告诉 AI 先读它们
3. 每次任务结束后更新记忆

这样即使换工具，也能很快接上。
