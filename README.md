## Kandid Assignment — Linkbird.ai UI (Leads & Campaigns)

Production demo: [kandid-assignment-harshit.vercel.app](https://kandid-assignment-harshit.vercel.app/)

### Overview
This project replicates core UI/UX from Linkbird.ai for two sections: Leads and Campaigns. It implements authentication (email/password + Google OAuth), a responsive dashboard layout (collapsible sidebar, breadcrumb header), data fetching via TanStack Query, and a PostgreSQL + Drizzle ORM backend.

### Tech Stack
- Next.js 15 (App Router), React 19
- Tailwind CSS + shadcn/ui
- PostgreSQL + Drizzle ORM
- Better Auth (credentials + Google OAuth)
- TanStack Query (React Query v5)
- Zustand (UI state)

### Live Demo
- URL: [kandid-assignment-harshit.vercel.app](https://kandid-assignment-harshit.vercel.app/)

---

## Features

- Authentication
  - Email/password login and registration (Better Auth)
  - Google OAuth login
  - Session management, logout, and protected dashboard routes

- Application Shell
  - Collapsible sidebar with active state and profile/logout
  - Mobile navigation overlay with backdrop and Escape-to-close
  - Persistent collapse state (localStorage)
  - Header with breadcrumbs and search

- Leads
  - Search and status filtering
  - Paginated/infinite loading pattern (Load More)
  - Lead detail side sheet with status update and campaign linkage
  - Loading skeletons and error states

- Campaigns
  - Campaigns table with status, totals, response rate, progress bar
  - Filters and aggregated summary cards
  - Actions menu with status update

---

## Getting Started (Local Development)

### 1) Prerequisites
- Node.js 20+
- PostgreSQL 14+

### 2) Install dependencies
```bash
npm install
```

### 3) Environment variables
Create a `.env` file in the project root:
```bash
# Database
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME

# Better Auth
BETTER_AUTH_SECRET=your-strong-random-secret
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (create OAuth credentials at Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional in deployment (Vercel sets this):
# VERCEL_URL=your-vercel-domain.vercel.app
```

### 4) Database setup (Drizzle ORM)
- Configure connection in `drizzle.config.ts` (already set up for `DATABASE_URL`).
- Run migrations (using the existing migrations in `drizzle/`):
```bash
npx drizzle-kit push
# or, if you prefer to generate then migrate:
npx drizzle-kit generate
npx drizzle-kit push
```

### 5) Run the app
```bash
npm run dev
# http://localhost:3000
```

### 6) Build & start
```bash
npm run build
npm start
```

### 7) Lint
```bash
npm run lint
```

---

## Project Structure (Key Paths)

- `src/app/`
  - `auth/login`, `auth/register`, `auth/callback`: Auth pages
  - `dashboard/`: Dashboard shell (sidebar + header + routes)
  - `api/`: Route handlers for auth, leads, campaigns, dashboard stats
- `src/components/`: UI components (sidebar, header, shadcn/ui primitives, leads sheet)
- `src/lib/`
  - `auth.ts`, `auth-client.ts`: Better Auth server/client
  - `db/`: Drizzle client and schema
  - `hooks/api.ts`: TanStack Query data hooks
  - `stores/`: Zustand store for UI state and selections

---

## API Overview (Selected)

All endpoints require an authenticated session unless specified.

- Auth (Better Auth handler)
  - `GET/POST /api/auth/[...auth]`

- Leads
  - `GET /api/leads?search=&filter=&page=&limit=` — List with filtering and pagination
  - `POST /api/leads` — Create a lead
  - `PATCH /api/leads` — Bulk updates (where applicable)
  - `GET /api/leads/[id]` — Lead by ID
  - `PATCH /api/leads/[id]` — Update a lead (e.g., status)

- Campaigns
  - `GET /api/campaigns?search=&filter=` — List campaigns with derived stats
  - `POST /api/campaigns` — Create a campaign

- Dashboard
  - `GET /api/dashboard/stats` — Aggregated stats for overview

---

## Notes on Implementation

- UI State
  - Sidebar collapse persists via `localStorage`.
  - Mobile menu state handled by Zustand; backdrop + Escape close implemented.

- Data Fetching
  - TanStack Query with sensible defaults and devtools enabled in development.

- Security
  - Server routes validate session via Better Auth before accessing user data.
  - Ensure strong `BETTER_AUTH_SECRET` in production and secure DB/network config.

---

## Deployment (Vercel)

1) Create a new Vercel project and link this repository.
2) Configure Environment Variables in Vercel Project Settings:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `BETTER_AUTH_URL` (e.g., `https://your-domain.vercel.app`)
3) Add a production PostgreSQL database (Neon, Supabase, or Vercel Postgres) and set `DATABASE_URL`.
4) Trigger a deployment; after the first build, run Drizzle migrations (if not automated) via a one-off job:
   - `npx drizzle-kit push`
5) Verify OAuth redirect URIs include:
   - `https://your-domain.vercel.app/api/auth/callback/google`
6) Visit the live app: [kandid-assignment-harshit.vercel.app](https://kandid-assignment-harshit.vercel.app/)

---

## Attribution
- Live demo: [kandid-assignment-harshit.vercel.app](https://kandid-assignment-harshit.vercel.app/)

