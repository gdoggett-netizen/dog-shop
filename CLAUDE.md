# CLAUDE.md — dog-shop

For full system context, vault structure, and pipeline overview: see `gdog-brains/CLAUDE.md`.

## Governance
This file is additive to `~/Gdog Brains/CLAUDE.md` and `Canon.md` — those govern first.
To override vault governance for this repo: write the override into this repo's `Canon.md`
under `## Overrides`, state what it overrides and why, and commit with `[human]` prefix.

## What this is
Dog Shop — a shared family shopping list PWA (Progressive Web App). Installs to the home screen on any phone and feels like a native app. Built for the Doggett family: Greg, Beth, and the kids all share one master list. Beth submits the cart to Walmart.

## Architecture
- `index.html` — the entire PWA frontend (HTML, CSS, JS in one file)
- `manifest.json` — PWA manifest (icon, name, display mode)
- `sw.js` — service worker (offline shell caching)
- `wrangler.toml` + `.assetsignore` — deploy config for the **frontend** Worker (serves only the PWA files as Workers Static Assets; `.assetsignore` keeps `.git`/source out of the public bundle)
- `worker/` — the **API** Worker (Cloudflare Worker + D1), with its own `worker/wrangler.toml`

## How it connects
- **Frontend** — a Cloudflare **Worker** (Workers Static Assets) at `https://dog-shop.gdoggett.workers.dev`, defined by the root `wrangler.toml`. Serves only `index.html`, `manifest.json`, `sw.js`, and the icons.
- **Backend (API)** — a *separate* Cloudflare Worker at `https://dog-shop-api.gdoggett.workers.dev` (`worker/`), defined by `worker/wrangler.toml`.
- **Storage** — Cloudflare D1 (`dog-shop`)

## API endpoints
- `GET /api/items` — fetch all items
- `POST /api/items` — add an item `{ name: string }`
- `DELETE /api/items/:id` — delete an item
- `PATCH /api/items/:id/check` — toggle checked state

## Local development
```bash
# from a clean checkout of this repo
python3 -m http.server 8080
# Open http://localhost:8080

# Worker dev:
cd worker
npx wrangler dev
```

## Deployment
Two Workers, deployed independently.

**Frontend** (`dog-shop`) — auto-deploys on push to main via `.github/workflows/deploy.yml`
(requires repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`). Manual, from repo root:
```bash
npx wrangler deploy          # serves the PWA files as Workers Static Assets
```

**API** (`dog-shop-api`) — manual deploy:
```bash
cd worker && npx wrangler deploy
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
