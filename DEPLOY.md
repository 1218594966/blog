# 部署说明

这份项目适合使用 `Ubuntu + Node.js + PM2 + Nginx` 部署。

## 一次性部署

```bash
cd /var/www
git clone <your-repo-url> personblog
cd /var/www/personblog
cp .env.example .env
npm install --production
pm2 start ecosystem.config.cjs --update-env
pm2 save
pm2 startup
```

## 环境变量

编辑：

```bash
nano /var/www/personblog/.env
```

示例：

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=change-this-to-a-long-random-string
SITE_URL=https://your-domain.com
```

修改后执行：

```bash
cd /var/www/personblog
pm2 restart personblog --update-env
pm2 save
```

## Nginx

可以从仓库模板复制一份配置，再按自己的域名、证书路径修改：

```bash
sudo cp /var/www/personblog/deploy/nginx.personblog.conf /etc/nginx/sites-available/personblog
sudo ln -sf /etc/nginx/sites-available/personblog /etc/nginx/sites-enabled/personblog
sudo nginx -t
sudo systemctl reload nginx
```

## 服务器重启后自动恢复

项目通过 `PM2 + systemd startup` 实现自动恢复。

确认命令：

```bash
pm2 status
systemctl status pm2-root
```

## 手动更新

本地推送到 GitHub 后，服务器手动更新：

```bash
cd /var/www/personblog
./deploy/update-from-github.sh
```

## 自动同步 GitHub

仓库内提供了自动同步脚本与 systemd timer：

- `deploy/sync-from-github.sh`
- `deploy/personblog-sync.service`
- `deploy/personblog-sync.timer`

启用方式：

```bash
sudo cp /var/www/personblog/deploy/personblog-sync.service /etc/systemd/system/
sudo cp /var/www/personblog/deploy/personblog-sync.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now personblog-sync.timer
```

启用后，服务器会定时检查 GitHub `main` 是否有更新；如果有，就自动拉取、校验并重启项目。

## 数据与密钥

运行时数据保存在：

```text
/var/www/personblog/storage
```

这里包括：

- 后台编辑后的站点内容
- 留言数据
- AI 私密配置

这些内容不受 `git pull` 影响，所以后续更新代码时，不需要每次重新配置 AI Key。
