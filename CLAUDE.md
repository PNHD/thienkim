# Thiên Kim Pipeline — agent guide

This repository contains only the Thiên Kim content-pipeline application (Cloudflare Worker + Hono + D1).

## Project boundary

Keep this codebase independent from unrelated projects. Do not import files, data, deployment settings, or implementation assumptions from other repositories unless the task explicitly requires it.

## Product decisions

1. The primary UI is Vietnamese with proper diacritics.
2. The main flow is a four-step wizard: decide → storyboard → prompts → save.
3. Pack deletion requires explicit confirmation.
4. Users may generate an initial idea instead of supplying one manually.
5. Do not collapse the staged workflow back into a one-shot generation flow without an explicit product decision.

## Configuration

Runtime credentials must come from Cloudflare secrets/configuration and must never be committed to the repository. The application currently expects provider configuration for its text-generation and image-generation workflow steps.

## Development notes

- Cloudflare Worker entry point: `src/index.ts`
- UI: `src/ui.ts`
- D1 schema/data access: `src/db/`
- Agent/workflow logic: `src/agents/`
- Shared helpers: `src/lib/`
- Local D1 initialization: `npm run db:init`
- Remote deployment: `npm run deploy`

Keep media/content source assets outside this repository unless they are explicitly intended to be versioned and redistribution rights are clear.
