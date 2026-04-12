#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/personblog}"
APP_NAME="${APP_NAME:-personblog}"
BRANCH="${BRANCH:-main}"

cd "${APP_DIR}"
git pull --ff-only origin "${BRANCH}"
npm install --omit=dev
npm run check
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "Project updated and restarted."
