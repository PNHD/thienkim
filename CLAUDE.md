# Thiên Kim — tk-pipeline (project guide for AI agents)

**This repo is ONLY the Thiên Kim pipeline app** (Cloudflare Worker: Hono + D1).
- Cloudflare Worker name: `thienkim` (see `wrangler.toml`); D1 db `tk-pipeline-db`.
- Intended live site: https://thienkim.pages.dev/ (set up its own GitHub repo + Cloudflare project).
- Deploy the worker with `npm run deploy` (wrangler). DB: `npm run db:init:remote`.

## Project boundary — do NOT mix projects
A separate, unrelated project — **WWM Calc** ("Where Winds Meet" calculator) — lives in `D:\WWM Calc` with repo `PNHD/wwm-calc` and site wonton-wwm.pages.dev. **Never bring WWM Calc code here, and never add Thiên Kim code into the WWM repo.** This `tk-pipeline` folder was previously sitting inside `D:\WWM Calc` by mistake and has been moved here.

## Notes
- The wider `D:\Thiên Kim` folder holds media/content assets (videos, images, n8n workflows, planner JSON). Those are NOT part of this code repo and should stay out of git (kept un-versioned).
- `requires `@cloudflare/workers-types` for D1Database types — make sure tsconfig includes them (that's why type-checking failed when this lived in the WWM repo).
