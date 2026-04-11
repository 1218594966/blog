# PersonBlog

一个可直接部署的个人主页 + Blog 项目，包含前台展示、后台编辑、留言收集，以及可接入 OpenAI 兼容接口的 AI 对话区。

适合用来搭建：

- 个人介绍主页
- AI 兴趣与学习记录
- 个人博客
- 项目展示页
- 带后台的个人站点

## 功能特性

- 前台个人主页与 Blog 展示
- 后台登录与内容编辑
- AI 对话区，支持 OpenAI 兼容接口
- 联系表单与留言保存
- PM2 守护进程部署
- Nginx 反向代理
- 支持服务器重启后自动恢复
- 支持从 GitHub 拉取更新

## 项目结构

```text
.
├─ content/                   # 仓库内默认内容模板
├─ deploy/                    # 部署、更新、自动同步脚本
├─ public/                    # 前台与后台静态资源
├─ storage/                   # 运行时数据目录（已加入 .gitignore）
├─ .env.example               # 环境变量示例
├─ DEPLOY.md                  # 部署说明
├─ ecosystem.config.cjs       # PM2 配置
├─ package.json
└─ server.js                  # Express 服务入口
```

## 本地开发

```bash
npm install
npm run dev
```

默认访问：

- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin-login`

## 环境变量

复制并编辑：

```bash
cp .env.example .env
```

至少建议配置：

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=change-this-to-a-long-random-string
SITE_URL=https://your-domain.com
```

## 数据存储

为了避免线上后台修改的内容被 Git 覆盖，运行时数据不会写回 `content/`，而是写到 `storage/`：

- `storage/site-content.json`
- `storage/messages.json`
- `storage/ai-config.json`
- `storage/ai-config.private.json`

这意味着：

- 可以放心在后台改内容
- 后续 `git pull` 不会轻易覆盖线上内容
- AI 私密 Key 不会进入 GitHub 仓库

## 部署

详细步骤见 [DEPLOY.md](./DEPLOY.md)。

基础流程：

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

本地改完后：

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

如果希望服务器自动跟随 GitHub 主分支更新，可以启用仓库内提供的 systemd timer：

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

## 开源建议

如果要作为公开仓库长期维护，建议补充：

- 仓库描述
- Topics，例如：`blog`、`personal-site`、`nodejs`、`express`、`ai`
- 合适的 `LICENSE`

如果你希望别人也能直接复用，可以进一步把站点文案、域名、证书路径等内容改成更通用的模板。
