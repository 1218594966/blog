# PersonBlog 部署说明

这份项目已经整理成适合 `Ubuntu + Node.js + PM2 + Nginx` 的线上版本，域名按 `xuxinyuan.xyz` 预设。

## 部署目标

- 仓库地址：`https://github.com/1218594966/blog.git`
- 线上目录：`/var/www/personblog`
- 站点域名：`xuxinyuan.xyz`
- 备用域名：`www.xuxinyuan.xyz`
- 进程管理：`PM2`
- 反向代理：`Nginx`

## 一键基础部署

服务器建议使用 `Ubuntu 22.04` 或更高版本，使用 `root` 执行：

```bash
apt update
apt install -y git
git clone https://github.com/1218594966/blog.git /var/www/personblog
cd /var/www/personblog
chmod +x deploy/setup-ubuntu.sh
./deploy/setup-ubuntu.sh
```

这个脚本会完成：

- 安装 Node.js 20、Nginx、Certbot、PM2
- 从 GitHub 拉取项目
- 安装依赖
- 创建 `.env`
- 启动 `personblog`
- 执行 `pm2 save`
- 配置 `pm2 startup`，确保服务器重启后自动恢复
- 写入 Nginx 配置

## 环境变量

第一次部署后，请编辑：

```bash
nano /var/www/personblog/.env
```

推荐至少修改这些值：

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=1218594966
ADMIN_PASSWORD=3919799439
SESSION_SECRET=换成一段很长很随机的字符串
SITE_URL=https://xuxinyuan.xyz
```

改完后重启应用：

```bash
cd /var/www/personblog
pm2 restart personblog --update-env
pm2 save
```

## HTTPS

域名解析到服务器公网 IP 后，执行：

```bash
certbot --nginx -d xuxinyuan.xyz -d www.xuxinyuan.xyz
```

成功后可访问：

- 前台：`https://xuxinyuan.xyz`
- 后台登录：`https://xuxinyuan.xyz/admin-login`

## 服务器重启后自动恢复

这套项目已经通过 `PM2 + systemd startup` 处理自动恢复。

你可以用下面命令确认：

```bash
pm2 status
systemctl status pm2-root
```

只要之前执行过：

```bash
pm2 save
pm2 startup systemd -u root --hp /root
```

服务器重启后，项目会自动拉起，不会因为重启就掉站。

## 后续更新

以后本地修改并推送到 GitHub 后，服务器只要执行：

```bash
cd /var/www/personblog
chmod +x deploy/update-from-github.sh
./deploy/update-from-github.sh
```

这个脚本会自动：

- `git pull`
- 安装新增依赖
- 重启 PM2
- 保存当前 PM2 进程列表

## 数据存储说明

线上运行时数据会写入：

```text
/var/www/personblog/storage
```

这里包括：

- 站点编辑内容
- 留言数据
- AI 私密配置

这些文件已经从 Git 跟踪中分离，所以你在后台改内容后，后续 `git pull` 不会轻易和运行时数据冲突。

## 健康检查

可用下面命令确认应用是否在线：

```bash
curl http://127.0.0.1:3000/api/health
curl https://xuxinyuan.xyz/api/health
```
