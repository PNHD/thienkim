# Thiên Kim Pipeline

Thiên Kim Pipeline is a small content-production workflow built on **Cloudflare Workers, Hono, D1, and TypeScript**. It turns an initial idea into a structured storyboard/prompt pack through a step-by-step Vietnamese interface.

## Workflow

The current product flow is intentionally staged rather than one-shot:

1. Decide the content direction.
2. Build a storyboard.
3. Generate production prompts.
4. Save the finished pack for later use.

Users can also ask the system to generate an initial idea instead of supplying one manually.

## Stack

- Cloudflare Workers
- Hono
- Cloudflare D1
- TypeScript
- AI-provider adapters for text/image workflow steps

## Development

```bash
npm install
npm run dev
```

Initialize the local D1 schema with:

```bash
npm run db:init
```

Deployment uses Wrangler:

```bash
npm run deploy
```

## Repository structure

- `src/index.ts` — Worker routes and application entry point
- `src/ui.ts` — server-rendered product UI
- `src/agents/` — content-generation workflow logic
- `src/db/` — D1 schema/data access
- `src/lib/` — shared helpers

## Status

This is an actively iterated internal-product prototype exposed here as implementation work. API credentials are not stored in the repository and must be provided through the deployment platform's secret/configuration system.
