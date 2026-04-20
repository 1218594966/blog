#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/personblog}"
APP_NAME="${APP_NAME:-personblog}"
BRANCH="${BRANCH:-main}"

cd "${APP_DIR}"

git restore --source=HEAD --staged --worktree package-lock.json 2>/dev/null || git checkout -- package-lock.json 2>/dev/null || true

git pull --ff-only origin "${BRANCH}"
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --omit=dev
fi
npm run check
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "Project updated and restarted."
