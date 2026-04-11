# PersonBlog

一个已经可以直接部署上线的个人主页 + Blog 项目，适合展示个人介绍、AI 兴趣方向、项目内容、文章内容，以及提供后台可编辑能力。

线上版本已经适配：

- `xuxinyuan.xyz`
- `www.xuxinyuan.xyz`
- `PM2` 守护进程
- `Nginx` 反向代理
- Cloudflare 代理场景

## 功能概览

- 前台个人主页与 Blog 展示
- 后台登录与内容编辑
- AI 对话区，支持 OpenAI 兼容接口
- 联系表单与留言保存
- 支持服务器重启后自动恢复
- 支持从 GitHub 拉取后更新

## 项目结构

```text
.
├─ content/                   # 仓库内默认内容模板
├─ deploy/                    # 部署、更新、自动同步脚本
├─ public/                    # 前台与后台静态资源
├─ storage/                   # 运行时数据目录（已加入 .gitignore）
├─ .env.example               # 环境变量示例
├─ DEPLOY.md                  # 详细部署说明
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

## 生产环境变量

复制并编辑：

```bash
cp .env.example .env
```

建议至少配置：

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=1218594966
ADMIN_PASSWORD=请改成更安全的密码
SESSION_SECRET=请改成更长更随机的字符串
SITE_URL=https://xuxinyuan.xyz
```

## 数据存储规则

为了避免服务器后台修改的内容被 Git 覆盖，运行时数据不会写回 `content/`，而是写到 `storage/`：

- `storage/site-content.json`
- `storage/messages.json`
- `storage/ai-config.json`
- `storage/ai-config.private.json`

这意味着：

- 你可以放心在后台改内容
- 后续 `git pull` 不会轻易覆盖线上内容
- AI 私密 Key 不会进入 GitHub 仓库

## 标准部署

详细步骤见 [DEPLOY.md](./DEPLOY.md)。

核心流程是：

```bash
git clone https://github.com/1218594966/blog.git /var/www/personblog
cd /var/www/personblog
cp .env.example .env
npm install --production
pm2 start ecosystem.config.cjs --update-env
pm2 save
pm2 startup
```

## 后续更新

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

## 自动跟随 GitHub 更新

如果你希望服务器自动跟随 GitHub 主分支更新，不想每次手动执行脚本，可以启用仓库内提供的 systemd timer。

安装：

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

这个定时器会定期检查 GitHub 的 `main` 是否有新提交，如果有就自动：

- `git pull`
- `npm install --production`
- `npm run check`
- `pm2 restart personblog --update-env`
- `pm2 save`

## GitHub 开源维护建议

为了后期维护更舒服，建议你在 GitHub 仓库页面补这些内容：

- 仓库描述
- Topics，例如：`blog`、`personal-site`、`nodejs`、`express`、`ai`
- README 置顶展示
- 后续根据你的意愿补一个正式 `LICENSE`

当前仓库已经适合公开维护，但 `LICENSE` 属于法律层面的选择，我建议你确定想用 `MIT`、`Apache-2.0` 还是其他协议之后再加。

## 关于服务器直连

我目前不能主动长期连接你的服务器。更稳妥的方式有两种：

- 你继续把命令输出发我，我按实际状态一步步帮你配置
- 你临时提供 SSH 访问方式时，我再按你的授权继续处理

对你当前这个项目来说，其实已经不需要每次都重新配 key：

- 仓库是公开的，服务器拉取代码不需要 GitHub 私钥
- 运行时密钥保存在 `.env` 和 `storage/`，不会因为 GitHub 更新而丢失
- 开启自动同步后，后续维护会轻松很多
