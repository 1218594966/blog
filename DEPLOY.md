# 部署说明

## 你现在需要知道的目录

- `site/`
  主站代码
- `deploy/`
  部署脚本和 Nginx 配置
- `storage/`
  服务器运行时数据

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

从仓库复制模板：

```bash
sudo cp /var/www/personblog/deploy/nginx.personblog.conf /etc/nginx/sites-available/personblog
sudo ln -sf /etc/nginx/sites-available/personblog /etc/nginx/sites-enabled/personblog
sudo nginx -t
sudo systemctl reload nginx
```

## 服务器重启后自动恢复

项目通过 `PM2 + systemd` 自动恢复。

检查：

```bash
pm2 status
systemctl status pm2-root
```

## 手动更新

```bash
cd /var/www/personblog
./deploy/update-from-github.sh
```

## 自动同步 GitHub

启用：

```bash
sudo cp /var/www/personblog/deploy/personblog-sync.service /etc/systemd/system/
sudo cp /var/www/personblog/deploy/personblog-sync.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now personblog-sync.timer
```

## 运行时数据

运行时数据在：

```text
/var/www/personblog/storage
```

包括：

- 站点内容
- 留言数据
- AI 私密配置

它们不会被 `git pull` 覆盖。
