# scaffold-mnadalc-project

Opinionated scaffolding CLI to generate React + Vite projects with optional Express backend.

## Getting Started

One-time setup:

```bash
pnpm install
pnpm build
pnpm link --global
```

Create a project:

```bash
scaffold-mnadalc-project my-app
```

If you omit the name, the CLI asks for it:

```bash
scaffold-mnadalc-project
```

## What It Solves

This project accelerates setup for new apps by generating a consistent structure and asking guided questions in the terminal.

## Core Capabilities

- React + Vite frontend
- Optional backend (`server/`) with Express
- Optional TypeScript on frontend and backend
- Database selection (`none`, `mysql`, `postgres`, `mongodb`)
- Optional Vitest and Playwright setup
- MSW defaults for frontend testing
- Zod v4 schema pattern (domain-split files)
- TanStack Query starter pattern (`queryOptions`, typed `QueryFunction`, safeParse validation)
- Mutation starter pattern with `useMutation` hook + validated payload/response flow
- Optional pnpm workspace (`client/` + `server/`) with root orchestration scripts
- Root Husky pre-commit hook in full-stack mode
- Backend includes CORS setup for Vite dev origin and a `/health` endpoint

## CLI Prompt Flow

The generator asks for:

1. Project name (unless passed as CLI argument)
2. Backend on/off
3. Frontend language
4. React version (`latest` or `18`)
5. Vitest on/off
6. Playwright on/off
7. Install default frontend packages preset or choose groups manually
8. Base frontend folders
9. Optional starter query/mutation files
10. Backend language (if backend enabled)
11. Database type (if backend enabled)
12. Backend zod validation (if backend enabled)
13. Install dependencies now with pnpm

## Important Defaults From Your Spec

- `ErrorBoundary` is always created in frontend `components`
- TypeScript prefers `type` aliases
- Zod is pinned to `^4.0.0`
- `@tanstack/react-query-devtools` is in `devDependencies`
- `.gitignore` includes logs, env files, and test artifacts
- Prettier config follows your exact formatting style
- E2E tests are generated under `src/e2e` (independent from `src/__tests__`)
- Starter API templates are generated from your own domain/query/mutation names (no hardcoded example names)
- Frontend aliases are configured (`@/`, `@api/`, `@components/`, `@contexts/`, `@models/`, `@test/`)

## Generated Modes

### Frontend-only mode

Single app at root, no `client/server` folders.

### Full-stack mode

Workspace with:

- `client/`
- `server/`
- root `package.json` scripts to run both packages

Root scripts in full-stack mode:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel dev",
    "build": "pnpm -r build",
    "test": "pnpm --filter client test",
    "test:run": "pnpm --filter client test:run",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "prepare": "husky .husky"
  }
}
```

Root pre-commit hook in full-stack mode:

```sh
#!/usr/bin/env sh

pnpm --filter client typecheck
pnpm --filter client exec lint-staged
pnpm --filter server build
pnpm --filter server lint
```

## Contributing / Local Development

```bash
pnpm install
pnpm dev
```

## Publish/Link Locally

```bash
pnpm build
pnpm link --global
scaffold-mnadalc-project my-app
```

## Current Layout

```txt
src/
  index.ts
  prompts.ts
  scaffold.ts
  types.ts
```
