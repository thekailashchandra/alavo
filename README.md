# Alavo (Private)

Personal habit tracker Progressive Web App — **private project, not open source**.

Do not publish this repository publicly or share secrets (`.env`, API keys, Neon credentials).

## Features

- Neon Auth (email/password) with app user sync
- Customizable habits, Today checklist, streaks, heatmaps, analytics
- Journal, PWA offline sync, Web Push scaffolding
- Settings: export, notifications, delete account

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Neon Postgres + Prisma
- Neon Auth (Managed Better Auth)
- Recharts, Web Push, Resend (optional email)

## Local setup

1. Copy `.env.example` → `.env` and fill values (especially `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`).
2. `npm install`
3. `npx prisma migrate dev`
4. `npm run dev` → [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:migrate` | Prisma migrate |
| `npm run db:studio` | Prisma Studio |

## Deploy (private)

- Frontend/API: Vercel (private project)
- Database/Auth: Neon
- Keep the GitHub repo **private** if you use one; never commit `.env`
