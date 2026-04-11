#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/personblog"
APP_NAME="personblog"
BRANCH="main"
LOCK_FILE="/tmp/personblog-sync.lock"

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "Another sync is already running."
  exit 0
fi

cd "${APP_DIR}"

git fetch origin "${BRANCH}"

LOCAL_HEAD="$(git rev-parse HEAD)"
REMOTE_HEAD="$(git rev-parse "origin/${BRANCH}")"

if [ "${LOCAL_HEAD}" = "${REMOTE_HEAD}" ]; then
  echo "No updates found."
  exit 0
fi

echo "Updates detected: ${LOCAL_HEAD} -> ${REMOTE_HEAD}"

git pull --ff-only origin "${BRANCH}"
npm install --production
npm run check
pm2 restart "${APP_NAME}" --update-env
pm2 save

echo "Sync completed successfully."
