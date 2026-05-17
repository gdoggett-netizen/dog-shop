# CLAUDE.md — dog-shop

For full system context, vault structure, and pipeline overview: see `gdog-brains/CLAUDE.md`.

## What this is
Dog Shop — a shared family shopping list PWA (Progressive Web App). Installs to the home screen on any phone and feels like a native app. Built for the Doggett family: Greg, Beth, and the kids all share one master list. Beth submits the cart to Walmart.

## Architecture
- `index.html` — the entire PWA frontend (HTML, CSS, JS in one file)
- `manifest.json` — PWA manifest (icon, name, display mode)
- `sw.js` — service worker (offline shell caching)
- `worker/` — Cloudflare Worker API + D1 database

## How it connects
- Frontend hosted on Cloudflare Pages (auto-deploys on push to main)
- Backend: Cloudflare Worker at `https://dog-shop-api.gdoggett.workers.dev`
- Storage: Cloudflare D1 (`dog-shop`)

## API endpoints
- `GET /api/items` — fetch all items
- `POST /api/items` — add an item `{ name: string }`
- `DELETE /api/items/:id` — delete an item
- `PATCH /api/items/:id/check` — toggle checked state

## Local development
```bash
cd ~/Desktop/dog-shop
python3 -m http.server 8080
# Open http://localhost:8080

# Worker dev:
cd worker
npx wrangler dev
```

## Deployment
Frontend — Cloudflare Pages auto-deploys on push to main.
Worker — manual deploy:
```bash
cd ~/Desktop/dog-shop/worker
npx wrangler deploy
```

## Commit conventions
Prefix: `[dog-shop]`
```bash
git add .
git commit -m "[dog-shop] YYYY-MM-DD — what changed — why"
git push
```

## Codex conventions

When a task is routed to Codex (OpenAI's coding agent):

- **Commit prefix:** `[codex]` — e.g. `[codex] 2026-05-16 — add item sorting`
- **Open a PR, don't merge** — Greg reviews and merges manually
- **Never run deploy commands** — always manual after Greg reviews the PR
- **If the task is unclear, say so in the PR description** — don't guess at intent
- **Don't add new dependencies without flagging them** — list in PR description with a one-line reason
- **Read the MUST NOT section of this file before starting** — applies to Codex same as Claude
- **Commit messages must capture the why:** When the reason for a change is not self-evident from the description, add it — `[prefix] YYYY-MM-DD — what changed — why`. Skip only when the what already implies the why (e.g., "fix typo"). When in doubt, include it.

## MUST NOT
1. Hardcode API tokens or secrets in source files
2. Commit `.dev.vars` or any file containing secrets
3. Force-push to main
4. Add new dependencies without flagging in PR description
