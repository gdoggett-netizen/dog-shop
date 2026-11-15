# dog-shop

**Status:** Active · **Type:** Family shopping-list PWA (two Cloudflare Workers + D1) · **Owner:** Greg (family) · **Lane:** personal / family

Dog Shop is the Doggett family's shared shopping-list PWA — installs to any phone's home screen, everyone adds to one master list, Beth submits the cart to Walmart. Frontend is `index.html`, served by the `dog-shop` Worker as static assets and deployed by hand (corrected 2026-11-14 to match `wrangler.toml` and `CLAUDE.md`; this said Cloudflare Pages with auto-deploy on push); the API + data live in `worker/` (Cloudflare Worker + D1). Operating contract: [`CLAUDE.md`](CLAUDE.md). Answers to the vault `Canon.md` + `CLAUDE.md` (master). Intended to connect into the orchestration system later (vault memory `project-dog-shop-orchestration`).

---
*Repo-doc standard, minimal tier (vault `Projects/Documentation Standard.md`).*
