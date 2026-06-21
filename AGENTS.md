<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: next-boilerplate

## Commands
- `npm run dev` — start dev server
- `npm run build` — prisma generate + next build
- `npm run lint` — eslint
- `npm run typecheck` — tsc --noEmit
- `npm run db:migrate` — prisma migrate dev
- `npm run db:seed` — tsx prisma/seed.ts

## Key conventions
- **Prisma 7**: client is generated to `src/generated/prisma/` (gitignored). Import from `@/generated/prisma/client`. Requires a driver adapter (`@prisma/adapter-pg`) — see `src/lib/prisma.ts`.
- **Auth.js v5**: config in `src/auth.ts`. Exports `handlers`, `auth`, `signIn`, `signOut`. Session strategy is JWT.
- **Proxy (not middleware)**: Next.js 16 renamed `middleware.ts` to `proxy.ts`. The proxy uses `getToken` from `next-auth/jwt` (not `auth()`) to avoid importing Prisma in the Edge Runtime.
- **shadcn/ui**: uses Base UI (`@base-ui/react`), not Radix. Composition uses `render` prop, not `asChild`.
- **Zod 4**: use top-level `z.email()` instead of `z.string().email()`.
