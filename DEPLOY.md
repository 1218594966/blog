# Deployment Guide

## What `deploy/` Is For

`deploy/` is the server automation area of this repository. It is not required for local development.

### File roles

| File | Role |
| --- | --- |
| `deploy/setup-ubuntu.sh` | One-line Ubuntu deployment script. Installs dependencies, clones or updates the repo, prepares `.env`, configures PM2, Nginx, and GitHub auto-sync. |
| `deploy/update-from-github.sh` | Manual update script. Pulls the latest code, installs packages, runs checks, and restarts the app. |
| `deploy/sync-from-github.sh` | Automatic update script used by systemd timer on the server. |
| `deploy/personblog-sync.service` | systemd service template for auto-sync. |
| `deploy/personblog-sync.timer` | systemd timer template that periodically checks GitHub for updates. |
| `deploy/nginx.personblog.conf` | Reference Nginx template for reverse proxy setup. |

---

## One-Line Deployment

On a fresh Ubuntu server, deployment can be completed with one command.

### HTTPS via Certbot

```bash
curl -fsSL https://raw.githubusercontent.com/1218594966/blog/main/deploy/setup-ubuntu.sh | sudo DOMAIN=your-domain.com WWW_DOMAIN=www.your-domain.com CERTBOT_EMAIL=you@example.com bash
```

### Full copy-paste example

```bash
curl -fsSL https://raw.githubusercontent.com/1218594966/blog/main/deploy/setup-ubuntu.sh | sudo DOMAIN=your-domain.com WWW_DOMAIN=www.your-domain.com CERTBOT_EMAIL=you@example.com ADMIN_USERNAME=admin ADMIN_PASSWORD=change-this-password SESSION_SECRET=replace-with-a-long-random-string bash
```

### HTTP only

```bash
curl -fsSL https://raw.githubusercontent.com/1218594966/blog/main/deploy/setup-ubuntu.sh | sudo DOMAIN=your-domain.com WWW_DOMAIN=www.your-domain.com bash
```

### Common optional variables

```bash
APP_DIR=/var/www/personblog
APP_NAME=personblog
REPO_URL=https://github.com/1218594966/blog.git
BRANCH=main
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=replace-with-a-long-random-string
SITE_URL=https://your-domain.com
```

If `.env` does not exist, the setup script creates it from `.env.example`.  
If `.env` already exists, the script preserves it and only fills missing values that are passed in.

---

## What The Script Does Automatically

The one-line setup script handles:

- installing Nginx, Git, Node.js, and PM2
- cloning or updating the repository
- creating `.env` if missing
- applying core environment variables
- installing production dependencies
- running `npm run check`
- starting the app with PM2
- enabling PM2 auto-start after reboot
- creating an Nginx site config
- enabling GitHub auto-sync with systemd timer
- optionally requesting HTTPS via Certbot

After it finishes, the app is already live and configured for auto-restart on reboot.

---

## DNS

Point these records to your server IP:

- `@`
- `www`

If you use Cloudflare or another proxy/CDN, make sure the domain is already resolving to the server before enabling automatic HTTPS.

---

## Runtime Data

Server-generated data is stored in:

```text
/var/www/personblog/storage
```

That includes:

- site content edited from the admin page
- contact messages
- AI config and private API key data

These files are not overwritten by `git pull`.

---

## Manual Update

If needed, the server can still be updated manually:

```bash
cd /var/www/personblog
./deploy/update-from-github.sh
```
