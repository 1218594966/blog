# PersonBlog

一个可直接部署的个人主页 + Blog 项目，适合用来搭建个人网站、AI 兴趣记录站、轻量内容站和后续可扩展的项目入口。

它目前包含：

- 主站首页
- 内容管理后台
- 留言收集
- OpenAI 兼容接口接入的 AI 对话区
- 面向未来扩展的 `/tools`、`/projects`、`/lab` 入口

## 功能概览

- 前台个人主页与博客展示
- 后台登录与内容编辑
- 访客留言提交与后台查看
- OpenAI 兼容模型配置、自动读取模型列表、前台对话
- PM2 部署与开机自启
- Nginx 反向代理
- GitHub 自动同步更新

## 项目结构

```text
.
├─ content/                   # 仓库内默认内容模板
├─ deploy/                    # 部署、更新、自动同步脚本
├─ docs/                      # 公开文档、路线图、架构说明
├─ public/                    # 前台、后台、扩展入口和静态资源
│  ├─ assets/
│  ├─ tools/
│  ├─ projects/
│  └─ lab/
├─ storage/                   # 运行时数据目录，已加入 .gitignore
├─ .env.example
├─ DEPLOY.md
├─ ecosystem.config.cjs
├─ package.json
└─ server.js
```

## 本地开发

```bash
npm install
npm run dev
```

默认访问：

- 前台：[http://localhost:3000](http://localhost:3000)
- 后台：[http://localhost:3000/admin-login](http://localhost:3000/admin-login)

## 环境变量

复制配置文件：

```bash
cp .env.example .env
```

建议至少配置：

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=change-this-to-a-long-random-string
SITE_URL=https://your-domain.com
```

## 运行时数据

为了避免线上后台修改的内容被 `git pull` 覆盖，运行时数据不会写回 `content/`，而是写到 `storage/`：

- `storage/site-content.json`
- `storage/messages.json`
- `storage/ai-config.json`
- `storage/ai-config.private.json`

这意味着：

- 可以放心在后台改内容
- 后续代码更新不会轻易覆盖线上内容
- AI 私密 Key 不会进入 GitHub 仓库

## 部署

完整部署说明见 [DEPLOY.md](./DEPLOY.md)。

最基础流程：

```bash
git clone <your-repo-url> /var/www/personblog
cd /var/www/personblog
cp .env.example .env
npm install --production
pm2 start ecosystem.config.cjs --update-env
pm2 save
pm2 startup
```

## 更新方式

本地修改后：

```bash
git add .
git commit -m "your change"
git push origin main
```

服务器手动更新：

```bash
cd /var/www/personblog
./deploy/update-from-github.sh
```

## 自动同步 GitHub

如果希望服务器自动跟随 GitHub `main` 分支更新，可以启用仓库内提供的 systemd timer：

```bash
sudo cp deploy/personblog-sync.service /etc/systemd/system/
sudo cp deploy/personblog-sync.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now personblog-sync.timer
```

查看状态：

```bash
systemctl status personblog-sync.timer
systemctl list-timers --all | grep personblog
```

自动同步会在检测到 GitHub `main` 有新提交时执行：

- `git pull`
- `npm install --production`
- `npm run check`
- `pm2 restart personblog --update-env`
- `pm2 save`

## 后续扩展建议

推荐把这个站点当成总入口，而不是把所有新功能都继续堆进首页。

- `/tools`
  放轻量工具和效率插件
- `/projects`
  放完整应用和长期维护项目
- `/lab`
  放实验原型和临时尝试

更多规划可以看：

- [项目架构](./docs/ARCHITECTURE.md)
- [路线图](./docs/ROADMAP.md)

## 开源建议

这个仓库已经适合公开维护。建议在 GitHub 页面补充：

- 仓库描述
- Topics，例如 `personal-site`、`blog`、`nodejs`、`express`、`ai`
- 截图或演示图
