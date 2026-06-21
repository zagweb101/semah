# Next Boilerplate

A production-ready Next.js boilerplate with everything you need to launch a SaaS — auth, billing, teams, emails, and deployment, all pre-configured.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | PostgreSQL + Prisma 7 ORM |
| Auth | Auth.js v5 (Google OAuth + Credentials) |
| Billing | Stripe (Subscriptions, Checkout, Billing Portal) |
| Teams | Organizations + Roles (Owner/Admin/Member) |
| Email | Resend + React Email templates |
| UI | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Validation | Zod 4 |
| Dark mode | next-themes |
| Toasts | sonner |
| Rate limiting | in-memory middleware |
| CI/CD | GitHub Actions |
| Deployment | Railway (Nixpacks or Docker) |

## Quick start

```bash
# 1. Clone or use as a GitHub template
git clone <your-template-url> my-app
cd my-app

# 2. Install dependencies (runs prisma generate automatically)
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, Stripe, and Resend keys

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. (Optional) Seed the database
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `AUTH_SECRET` | NextAuth secret (`npx auth secret`) | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `STRIPE_SECRET_KEY` | Stripe API secret key | For billing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For billing |
| `STRIPE_PRICE_STARTER` | Stripe price ID for Starter plan | For billing |
| `STRIPE_PRICE_PRO` | Stripe price ID for Pro plan | For billing |
| `STRIPE_PRICE_BUSINESS` | Stripe price ID for Business plan | For billing |
| `RESEND_API_KEY` | Resend API key | For email |
| `FROM_EMAIL` | From email address | For email |

## Features

### Authentication
- Google OAuth + email/password credentials
- JWT sessions with Prisma adapter
- Protected routes via `proxy.ts` (Edge)
- Login, register, and error pages

### Stripe Billing
- 3 pricing plans (Starter, Pro, Business)
- Checkout sessions with redirect
- Webhook handler for subscription events
- Customer billing portal for self-service
- Subscription tracking in the database

### Teams & Multi-tenancy
- Create organizations with unique slugs
- Invite members by email
- Roles: Owner, Admin, Member
- Remove members (admins only)
- Delete organizations (owner only)

### Email (Resend)
- Welcome email on registration
- Password reset email template
- React Email components for maintainability
- Graceful fallback to console.log in dev (no API key needed)

### UI/UX
- Dark mode with system detection
- Toast notifications (sonner)
- Error and 404 pages
- Loading states
- Health check endpoint (`/api/health`)

## Project structure

```
src/
├── app/
│   ├── (auth)/              # Login, register, pricing
│   ├── (protected)/         # Dashboard, billing, teams
│   ├── api/
│   │   ├── auth/            # Auth.js route handler
│   │   ├── health/          # Health check
│   │   └── stripe/webhook/  # Stripe webhooks
│   ├── error.tsx            # Global error boundary
│   ├── not-found.tsx        # 404 page
│   ├── loading.tsx          # Global loading UI
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── emails.tsx           # React Email templates
│   ├── providers.tsx        # Session + Theme + Toaster
│   ├── navbar.tsx           # Navigation
│   ├── pricing-table.tsx    # Stripe pricing cards
│   ├── create-org-form.tsx  # Team creation
│   ├── invite-member-form.tsx
│   ├── member-list.tsx
│   └── manage-billing-button.tsx
├── lib/
│   ├── actions/             # Server actions (auth, stripe, orgs, email)
│   ├── validations/         # Zod schemas
│   ├── stripe.ts            # Stripe client + plans config
│   ├── resend.ts            # Email client
│   ├── prisma.ts            # Prisma client singleton
│   ├── rate-limit.ts        # Rate limiting utility
│   └── utils.ts             # cn() helper
├── auth.ts                  # NextAuth configuration
├── proxy.ts                 # Route protection (Edge)
└── types/                   # Type augmentations
```

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client + build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run db:migrate` | Create & apply migration (dev) |
| `npm run db:deploy` | Apply pending migrations (prod) |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

## Setting up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the [dashboard](https://dashboard.stripe.com/apikeys)
3. Create 3 products (Starter $9, Pro $29, Business $99) and copy their price IDs
4. Set up a webhook endpoint for `https://yourdomain.com/api/stripe/webhook`
5. For local development: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
6. Fill in all `STRIPE_*` variables in `.env`

## Setting up Resend

1. Create an account at [resend.com](https://resend.com)
2. Get your API key from [API Keys](https://resend.com/api-keys)
3. (Optional) Verify your domain for custom from-email
4. Set `RESEND_API_KEY` and `FROM_EMAIL` in `.env`
5. Without a key, emails log to console (dev mode)

## Deploying to Railway

### Option A: Railway GitHub integration (recommended)

1. Push this repo to GitHub
2. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub repo
3. Add a PostgreSQL database service
4. Set all environment variables
5. Railway auto-deploys on every push to `main`

The `railway.toml` runs `prisma migrate deploy` before starting the app.

### Option B: GitHub Actions deploy

1. In Railway, create a project and get a **token** + **service ID**
2. Add GitHub repo secrets: `RAILWAY_TOKEN`, `RAILWAY_SERVICE_ID`
3. Push to `main` — the deploy workflow runs `railway up`

### Option C: Docker

```bash
docker build -t my-app .
docker run -p 3000:3000 --env-file .env my-app
```

## Using this as a template

1. Click **"Use this template"** on GitHub to create a new repo
2. Clone the new repo
3. Follow the Quick start steps above
