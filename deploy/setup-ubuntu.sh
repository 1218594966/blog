#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/personblog}"
REPO_URL="${REPO_URL:-https://github.com/1218594966/blog.git}"
APP_NAME="${APP_NAME:-personblog}"
BRANCH="${BRANCH:-main}"
PORT="${PORT:-3000}"
DOMAIN="${DOMAIN:-}"
WWW_DOMAIN="${WWW_DOMAIN:-}"
SITE_URL="${SITE_URL:-}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-change-this-password}"
SESSION_SECRET="${SESSION_SECRET:-}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-}"

if [ "${EUID}" -ne 0 ]; then
  echo "Please run this script as root."
  exit 1
fi

if [ -z "${DOMAIN}" ]; then
  echo "DOMAIN is required."
  echo "Example:"
  echo "  DOMAIN=example.com WWW_DOMAIN=www.example.com CERTBOT_EMAIL=you@example.com bash deploy/setup-ubuntu.sh"
  exit 1
fi

if [ -z "${WWW_DOMAIN}" ]; then
  WWW_DOMAIN="www.${DOMAIN}"
fi

if [ -z "${SITE_URL}" ]; then
  SITE_URL="https://${DOMAIN}"
fi

if [ -z "${SESSION_SECRET}" ]; then
  SESSION_SECRET="$(openssl rand -hex 32)"
fi

upsert_env() {
  local key="$1"
  local value="$2"
  local file="$3"

  if grep -q "^${key}=" "${file}"; then
    sed -i "s#^${key}=.*#${key}=${value}#" "${file}"
  else
    printf "%s=%s\n" "${key}" "${value}" >> "${file}"
  fi
}

write_sync_service() {
  cat > "/etc/systemd/system/${APP_NAME}-sync.service" <<EOF
[Unit]
Description=Sync ${APP_NAME} from GitHub
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
WorkingDirectory=${APP_DIR}
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=/bin/bash ${APP_DIR}/deploy/sync-from-github.sh
EOF
}

write_sync_timer() {
  cat > "/etc/systemd/system/${APP_NAME}-sync.timer" <<EOF
[Unit]
Description=Check GitHub for ${APP_NAME} updates

[Timer]
OnBootSec=3min
OnUnitActiveSec=2min
Unit=${APP_NAME}-sync.service

[Install]
WantedBy=timers.target
EOF
}

write_http_nginx() {
  cat > "/etc/nginx/sites-available/${APP_NAME}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    client_max_body_size 20m;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 120s;
    }
}
EOF
}

export DEBIAN_FRONTEND=noninteractive

apt update
apt install -y nginx curl ca-certificates git openssl

if [ -n "${CERTBOT_EMAIL}" ]; then
  apt install -y certbot python3-certbot-nginx
fi

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

mkdir -p "$(dirname "${APP_DIR}")"

if [ ! -d "${APP_DIR}/.git" ]; then
  git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
else
  cd "${APP_DIR}"
  git fetch origin "${BRANCH}"
  git pull --ff-only origin "${BRANCH}"
fi

cd "${APP_DIR}"

if [ ! -f .env ]; then
  cp .env.example .env
fi

upsert_env "NODE_ENV" "production" ".env"
upsert_env "PORT" "${PORT}" ".env"
upsert_env "ADMIN_USERNAME" "${ADMIN_USERNAME}" ".env"
upsert_env "ADMIN_PASSWORD" "${ADMIN_PASSWORD}" ".env"
upsert_env "SESSION_SECRET" "${SESSION_SECRET}" ".env"
upsert_env "SITE_URL" "${SITE_URL}" ".env"

npm install --omit=dev
npm run check

pm2 startOrReload ecosystem.config.cjs --update-env

pm2 save
pm2 startup systemd -u root --hp /root

write_http_nginx
ln -sf "/etc/nginx/sites-available/${APP_NAME}" "/etc/nginx/sites-enabled/${APP_NAME}"
nginx -t
systemctl reload nginx

write_sync_service
write_sync_timer
systemctl daemon-reload
systemctl enable --now "${APP_NAME}-sync.timer"

if [ -n "${CERTBOT_EMAIL}" ]; then
  certbot --nginx --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" -d "${DOMAIN}" -d "${WWW_DOMAIN}" --redirect
fi

echo
echo "Deployment completed."
echo "App directory: ${APP_DIR}"
echo "Primary URL: ${SITE_URL}"
echo "Admin login: ${SITE_URL}/admin-login"
echo "PM2 app: ${APP_NAME}"
echo "Auto-sync timer: ${APP_NAME}-sync.timer"
