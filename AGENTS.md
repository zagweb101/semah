<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: SEMAH AI Brand Studio

A production-ready Next.js app for building corporate/brand identities with AI. Arabic-first, RTL.

> **Note for agents:** the active product code lives on branch `feat/semah-mvp`. `master` still contains the original boilerplate only.

## Commands
- `npm run dev` — start dev server
- `npm run build` — prisma generate + next build
- `npm run lint` — eslint
- `npm run typecheck` — tsc --noEmit
- `npm run test:unit` — run vitest unit tests in `src/**/*.test.ts`
- `npm run test:all` — run all vitest tests
- `npm run test:e2e` — run Playwright E2E tests (requires dev server + DATABASE_URL)
- `npm run db:migrate` — prisma migrate dev
- `npm run db:deploy` — apply migrations in production
- `npm run db:seed` — tsx prisma/seed.ts
- `npm run db:studio` — open Prisma Studio

## Key conventions
- **Prisma 7**: client is generated to `src/generated/prisma/` (gitignored). Import from `@/generated/prisma/client`. Requires a driver adapter (`@prisma/adapter-pg`) — see `src/lib/prisma.ts`.
- **Auth.js v5**: config in `src/auth.ts`. Exports `handlers`, `auth`, `signIn`, `signOut`. Session strategy is JWT.
- **Proxy (not middleware)**: Next.js 16 renamed `middleware.ts` to `proxy.ts`. The proxy uses `getToken` from `next-auth/jwt` (not `auth()`) to avoid importing Prisma in the Edge Runtime.
- **shadcn/ui**: uses Base UI (`@base-ui/react`), not Radix. Composition uses `render` prop, not `asChild`.
- **Zod 4**: use top-level `z.email()` instead of `z.string().email()`.
- **AI providers**: abstracted behind `src/lib/ai/providers/factory.ts`. Mock mode works without API keys; set `AI_MOCK_MODE=true` or leave AI keys empty.

## Development setup
1. `cp .env.example .env` and fill in at least `DATABASE_URL` and `AUTH_SECRET`.
2. `npm install`
3. Start Postgres locally (e.g. `docker compose up -d` using `docker-compose.yml`).
4. `npm run db:migrate`
5. (Optional) `npm run db:seed`
6. `npm run dev`

## Deployment
- Live URL: https://semah-production.up.railway.app
- Railway project: `semah` (Project ID: `5fb5bfbf-3735-40f6-bf5d-fe812a157840`)
- `railway.toml` runs `npx prisma migrate deploy && npm run start`.
- Deploy via CLI: `railway up --service <service-id> --detach --yes`
- Ensure all SEMAH migrations (including `20260622180000_add_semah_domain`) are present before deploying.
- The proxy (`src/proxy.ts`) must pass `secureCookie` to `getToken` for HTTPS deployments.
- Required environment variables for production:
  - `DATABASE_URL`, `AUTH_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`
  - `RESEND_API_KEY`, `FROM_EMAIL`
  - `NEXT_PUBLIC_APP_URL`
  - `AI_MOCK_MODE` — set `true` to run without AI keys
  - Optional AI keys: `AI_TEXT_*`, `AI_IMAGE_*`
- After deploying, verify:
  - `GET /api/health` returns `ok`.
  - `GET /api/health/db` returns `database: connected`.
  - `POST /api/auth/[...nextauth]` accepts credentials login.
  - Registration/login emails are sent via Resend once configured.
- Seed production DB: create a TCP proxy for Postgres, then run `npm run db:seed` with the proxy URL.
