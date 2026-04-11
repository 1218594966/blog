# 部署说明

这份项目已经整理成适合 `Ubuntu + Node.js + PM2 + Nginx` 的线上版本。

当前推荐部署信息：

- 仓库地址：`https://github.com/1218594966/blog.git`
- 项目目录：`/var/www/personblog`
- 域名：`xuxinyuan.xyz`
- 进程管理：`PM2`
- 反向代理：`Nginx`
- CDN / 证书：`Cloudflare`

## 一次性部署

```bash
cd /var/www
git clone https://github.com/1218594966/blog.git personblog
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

建议至少设置：

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=1218594966
ADMIN_PASSWORD=请改成更安全的密码
SESSION_SECRET=请改成一段更长更随机的字符串
SITE_URL=https://xuxinyuan.xyz
```

更新环境变量后，执行：

```bash
cd /var/www/personblog
pm2 restart personblog --update-env
pm2 save
```

## Nginx

`xuxinyuan.xyz` 的站点配置可以直接使用：

```bash
sudo cp /var/www/personblog/deploy/nginx.personblog.conf /etc/nginx/sites-available/xuxinyuan.xyz
sudo ln -sf /etc/nginx/sites-available/xuxinyuan.xyz /etc/nginx/sites-enabled/xuxinyuan.xyz
sudo nginx -t
sudo systemctl reload nginx
```

如果你已经有 Cloudflare 证书，建议把证书路径改成自己的现有路径。

## 服务器重启后自动恢复

项目已经通过 `PM2 + systemd startup` 实现自动恢复。

确认命令：

```bash
pm2 status
systemctl status pm2-root
```

## 手动更新

本地推送到 GitHub 后，服务器手动更新只需要：

```bash
cd /var/www/personblog
./deploy/update-from-github.sh
```

## 自动同步 GitHub

仓库内已经提供了自动同步脚本与 systemd timer：

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

启用后，服务器会按固定频率检查 GitHub `main` 是否有更新；如果有，就自动拉取、校验并重启项目。

## 数据与密钥

运行时数据保存在：

```text
/var/www/personblog/storage
```

这里包括：

- 后台编辑后的站点内容
- 留言数据
- AI 私密配置

这些内容不受 `git pull` 影响，所以你后续更新代码时，不需要每次重新配置 AI Key。
