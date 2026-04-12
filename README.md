# PersonBlog

一个可部署的个人网站仓库，适合继续扩展成：

- 主站
- 博客
- AI 工具入口
- 独立项目入口
- AI 协作开发工作流

这次已经把目录按“用途”重新整理过，尽量更适合小白理解。

## 现在最重要的 4 个文件夹

### `site/`

主站代码都在这里。

你以后只要想改当前网站本身，优先看这里。

里面主要有：

- `site/server.js`
  网站服务端入口
- `site/public/`
  前台页面、后台页面、样式和前端脚本
- `site/content/`
  默认内容模板

### `extensions/`

后面要增加的工具、项目、实验入口都在这里。

目前有：

- `extensions/tools/`
  工具中心
- `extensions/projects/`
  项目中心
- `extensions/lab/`
  实验区

以后你新增一个小工具，优先考虑放进 `extensions/tools/` 对应的页面或子目录。  
以后你新增一个更完整的项目，优先考虑放进 `extensions/projects/`。  

### `deploy/`

和服务器部署、Nginx、自动同步 GitHub 有关的文件都在这里。

你以后需要服务器相关配置时，优先看这里。

### `workflow/`

给 AI 协作开发使用的工作流都在这里。

里面主要有：

- `workflow/agent.md`
  AI 读取的项目规则
- `workflow/memory/`
  项目记忆、当前任务、历史工作记录
- `workflow/scripts/`
  开始任务、输出上下文、结束任务的脚本
- `workflow/docs/`
  AI 工作流、架构、路线图

## 根目录这些文件是干什么的

- `README.md`
  仓库总说明
- `DEPLOY.md`
  部署说明
- `AGENTS.md`
  给支持 AGENTS 规范的 AI 工具的入口文件
- `package.json`
  启动命令和 AI 工作流命令
- `ecosystem.config.cjs`
  PM2 运行配置
- `.env.example`
  环境变量示例

## 一句话理解现在的结构

- `site` = 当前主站代码
- `extensions` = 后续新增工具和项目
- `deploy` = 服务器部署
- `workflow` = AI 协作工作流

## 常用命令

启动本地网站：

```bash
npm install
npm run dev
```

AI 任务开始：

```bash
npm run ai:start -- "任务摘要"
```

输出 AI 上下文：

```bash
npm run ai:context
```

AI 任务结束并写入记忆：

```bash
npm run ai:finish -- "完成摘要"
```

## AI 工作流读取顺序

如果你以后让 AI 接手项目，最稳的开场方式是：

```text
先按 AGENTS.md 的要求读取上下文，再继续当前任务。
```

仓库内部的标准读取顺序是：

1. `AGENTS.md`
2. `workflow/agent.md`
3. `workflow/memory/current-task.md`
4. `workflow/memory/project-memory.md`
5. `workflow/memory/work-log.md`
6. `workflow/docs/ARCHITECTURE.md`
7. `workflow/docs/ROADMAP.md`

## 运行时数据

线上后台改动不会写回仓库，而是写到 `storage/`：

- `storage/site-content.json`
- `storage/messages.json`
- `storage/ai-config.json`
- `storage/ai-config.private.json`

这样做的目的是：

- GitHub 保持干净
- 服务器更新代码时不覆盖线上内容
- AI Key 不进入版本库

## 部署

部署说明见：

- [DEPLOY.md](./DEPLOY.md)

## 后续建议

下一步最适合继续做的是：

1. 拆分 `site/server.js`
2. 拆分 `site/public/assets/site.js`
3. 拆分 `site/public/assets/admin.js`
4. 在 `extensions/tools/` 或 `extensions/lab/` 里落地第一个真实功能页
