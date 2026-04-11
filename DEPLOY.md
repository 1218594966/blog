# PersonBlog 部署说明

这是一份适用于 `Ubuntu + Node.js + PM2 + Nginx` 的部署方案。

## 1. 上传项目

把整个项目上传到服务器，例如：

```bash
scp -r ./ root@your-server-ip:/var/www/personblog
```

如果你在 Windows PowerShell 中执行：

```powershell
scp -r "D:\Work\Desktop\研究\AI\PersonBlog\*" root@你的服务器IP:/var/www/personblog/
```

## 2. 安装运行环境

```bash
sudo apt update
sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

## 3. 安装依赖

```bash
cd /var/www/personblog
npm install --production
```

## 4. 设置环境变量

建议先在服务器设置：

```bash
export ADMIN_USERNAME=1218594966
export ADMIN_PASSWORD=3919799439
export SESSION_SECRET=换成你自己的长随机字符串
```

如果你想长期生效，可以写进 `/etc/profile`、`.bashrc` 或 PM2 的启动环境里。

## 5. 启动项目

```bash
cd /var/www/personblog
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 6. 配置 Nginx

复制项目里的模板文件：

```bash
sudo cp /var/www/personblog/deploy/nginx.personblog.conf /etc/nginx/sites-available/personblog
```

然后把其中的：

- `your-domain.com`
- `www.your-domain.com`

替换成你的真实域名。

启用站点：

```bash
sudo ln -s /etc/nginx/sites-available/personblog /etc/nginx/sites-enabled/personblog
sudo nginx -t
sudo systemctl reload nginx
```

## 7. 域名解析

去你的域名服务商后台添加：

- `@` 的 `A` 记录指向服务器公网 IP
- `www` 的 `A` 记录指向服务器公网 IP

## 8. 配置 HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 9. 常用命令

查看日志：

```bash
pm2 logs personblog
```

重启应用：

```bash
pm2 restart personblog
```

查看状态：

```bash
pm2 status
```

## 10. 后台地址

- 前台首页：`https://你的域名`
- 后台登录：`https://你的域名/admin-login`

当前默认后台账号密码：

- 账号：`1218594966`
- 密码：`3919799439`

上线后强烈建议改掉。
