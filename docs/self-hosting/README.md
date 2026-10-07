# Self-hosting Alavo

Self-hosted Alavo is the full core habit tracker. It does not require an Alavo Cloud account, a payment provider, or a license check.

## What you need today

Authentication is Supabase Auth. The database is Postgres through Prisma. You bring both. They can be a Supabase project you control, or Postgres plus a Supabase-compatible auth setup you operate. Alavo does not phone home to alavo.cc for the core app.

1. Install Node.js 20+.
2. `npm install --legacy-peer-deps`
3. Copy `app/.env.example` to `app/.env`.
4. Set `DEPLOYMENT_MODE=self-hosted`.
5. Set `DATABASE_URL`, `DIRECT_URL`, and your Supabase URL and keys.
6. Set a long `CRON_SECRET` if you will call reminder or report routes.
7. `npm run db:migrate`
8. `npm run dev:app` or `npm run build` and `npm run start --workspace=@alavo/app`

Open http://localhost:3000, create an account on **your** auth project, and track habits. Limits that exist on Alavo Cloud's free plan are not applied in this mode.

## What is not required

- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- An account on app.alavo.cc
- A phone-home or activation request

Email and web push are optional. Without SMTP and VAPID keys, tracking still works; mail and push do not.

## Docker

`docker-compose.yml` starts Postgres and the app image. You still must supply Supabase auth settings in `app/.env`. It is not a complete one-command install until auth can run without a separate Supabase project.

```bash
docker compose up -d --build
```

## Backups and updates

Back up the Postgres database on your own schedule. Pull a newer release and run `npm run db:deploy` before serving traffic. There are no down migrations.

## HTTPS

Put a reverse proxy such as Caddy or nginx in front of port 3000 and terminate TLS there. Set `NEXT_PUBLIC_APP_URL` to the public https URL.
