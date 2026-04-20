#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/personblog}"
APP_NAME="${APP_NAME:-personblog}"
BRANCH="${BRANCH:-main}"
LOCK_FILE="${LOCK_FILE:-/tmp/personblog-sync.lock}"

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "Another sync is already running."
  exit 0
fi

cd "${APP_DIR}"

# Avoid a dirty local lockfile blocking fast-forward pulls.
git restore --source=HEAD --staged --worktree package-lock.json 2>/dev/null || git checkout -- package-lock.json 2>/dev/null || true

git fetch origin "${BRANCH}"

LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git rev-parse "origin/${BRANCH}")"

if [ "${LOCAL_HEAD}" = "${REMOTE_HEAD}" ]; then
  echo "No updates found."
  exit 0
fi

echo "Updates detected: ${LOCAL_HEAD} -> ${REMOTE_HEAD}"

git pull --ff-only origin "${BRANCH}"
if [ -f package-lock.json ]; then
  npm ci --omit=dev
else
  npm install --omit=dev
fi
npm run check
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "Sync completed successfully."
