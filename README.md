# Alavo (Private monorepo)

Personal habit tracker — **private project, not open source**.

```
alavo/
├── website/     # Marketing site → alavo.cc (dev :3001)
├── app/         # Product PWA     → app.alavo.cc (dev :3000)
└── packages/
    ├── brand/   # Logo + brand tokens
    └── tsconfig/
```

## Local setup

1. `npm install --legacy-peer-deps`
2. Copy `app/.env.example` → `app/.env` and fill Neon / Gmail / VAPID values.
3. Optional website env: `website/.env.local` with `NEXT_PUBLIC_PRODUCT_URL=http://localhost:3000`
4. `npm run db:migrate`
5. Product: `npm run dev:app` → http://localhost:3000  
   Marketing: `npm run dev:website` → http://localhost:3001

## Scripts

| Command | Description |
|---|---|
| `npm run dev:app` | Product app (port 3000) |
| `npm run dev:website` | Marketing site (port 3001) |
| `npm run build` | Build all workspaces |
| `npm run lint` / `typecheck` | Across workspaces |
| `npm run db:migrate` | Prisma migrate (app) |

## Domains

- `alavo.cc` → deploy `website/`
- `app.alavo.cc` → deploy `app/`
- Neon Auth trusted domains should include both origins (+ localhost for dev)

## Deploy

- Two Vercel projects from this repo (`website` and `app` roots)
- Keep the GitHub repo **private**; never commit `.env`
- **Pre-deploy checklist:** see [`PRE-DEPLOY.md`](./PRE-DEPLOY.md)
- **Deploy guide:** see [`DEPLOY.md`](./DEPLOY.md)
