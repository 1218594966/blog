#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/personblog"
REPO_URL="https://github.com/1218594966/blog.git"
APP_NAME="personblog"
DOMAIN="xuxinyuan.xyz"
WWW_DOMAIN="www.xuxinyuan.xyz"

if [ "${EUID}" -ne 0 ]; then
  echo "Please run this script as root."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt update
apt install -y nginx curl ca-certificates git certbot python3-certbot-nginx

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

mkdir -p /var/www

if [ ! -d "${APP_DIR}/.git" ]; then
  git clone "${REPO_URL}" "${APP_DIR}"
else
  cd "${APP_DIR}"
  git pull --ff-only origin main
fi

cd "${APP_DIR}"
npm install --production
npm run check

if [ ! -f .env ]; then
  cp .env.example .env
fi

if pm2 describe "${APP_NAME}" >/dev/null 2>&1; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start ecosystem.config.cjs --update-env
fi

pm2 save
pm2 startup systemd -u root --hp /root

cp deploy/nginx.personblog.conf /etc/nginx/sites-available/personblog
ln -sf /etc/nginx/sites-available/personblog /etc/nginx/sites-enabled/personblog
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo
echo "Base deployment is complete. Next steps:"
echo "1. nano ${APP_DIR}/.env"
echo "2. Change SESSION_SECRET to a long random string"
echo "3. Update admin username/password if needed"
echo "4. pm2 restart ${APP_NAME} --update-env"
echo "5. certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN}"
