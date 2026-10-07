# Contributing to Alavo

Thanks for helping improve Alavo. The goal is a trustworthy open-source habit tracker and a clearly separate paid hosting service.

## Setup

1. Node.js 20 or newer.
2. `npm install --legacy-peer-deps`
3. Copy `app/.env.example` to `app/.env` and fill in your own database and Supabase project.
4. Optional: `website/.env.local` with `NEXT_PUBLIC_PRODUCT_URL=http://localhost:3000`
5. `npm run db:migrate`
6. `npm run dev:app`

For self-hosted behavior locally, set `DEPLOYMENT_MODE=self-hosted` in `app/.env`. Leave it as `cloud` when you are working on hosted billing.

## Branches

- `main` is the stable line.
- Use a short branch name such as `fix/export-empty-journal` or `docs/self-hosting`.

## Checks

Before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run test
```

Run `npm run build` when you change routes, config, or the marketing site.

## Pull requests

- Describe the user-facing change and why it is needed.
- Do not include secrets, `.env` files, or production data.
- Do not add a free Alavo Cloud tier.
- Do not remove or weaken self-hosted core features.
- Database changes must be Prisma migrations. Do not drop tables or reset data.

## Commits

Write a short message about why the change exists. Example: `Unlock the full core app in self-hosted mode`.

## Issues

Include what you expected, what happened, and whether you are on Alavo Cloud or a self-hosted install. Do not paste journal text, habit names you consider private, or credentials.
