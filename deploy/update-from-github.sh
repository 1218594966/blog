#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/personblog"
APP_NAME="personblog"

cd "${APP_DIR}"
git pull --ff-only origin main
npm install --production
npm run check
pm2 restart "${APP_NAME}" --update-env
pm2 save

echo "Project updated and restarted."
