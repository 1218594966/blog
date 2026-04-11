#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/personblog"
APP_NAME="personblog"
BRANCH="main"

cd "${APP_DIR}"
git pull --ff-only origin "${BRANCH}"
npm install --production
npm run check
pm2 restart "${APP_NAME}" --update-env
pm2 save

echo "Project updated and restarted."
