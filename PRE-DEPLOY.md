# Pre-Deployment Checklist — Alavo

Use this before every production release. Items marked **Auto** are enforced in CI or code; **Manual** require human action.

---

## Code & Build Quality

| Item | Status | Notes |
|------|--------|-------|
| CI pipeline green (lint, typecheck, test, build) | **Auto** | `.github/workflows/ci.yml` |
| Unit tests | **Auto** | Vitest in `app/lib/*.test.ts`; run `npm run test` |
| Integration / E2E tests | **Manual / Planned** | Not yet configured (Playwright recommended for login + habit flows) |
| Dependencies locked | **Auto** | `package-lock.json` committed; `npm ci` in CI |
| Dependency audit | **Auto** | CI runs `npm audit --audit-level=high` (non-blocking for transitive dev deps) |
| Dependabot | **Auto** | `.github/dependabot.yml` — weekly npm PRs |
| Asset optimization | **Partial** | Next.js minify/tree-shake by default; Vercel CDN + immutable cache on `/_next/static/*` (website). App PWA assets in `next.config.ts`. |
| Feature flags | **Partial** | Env toggles: `EXPOSE_VERIFY_LINK`, `ALLOWED_ORIGINS`, `NODE_ENV`. No third-party flag service. Verify prod values in Vercel before deploy. |

---

## Security & Compliance

| Item | Status | Notes |
|------|--------|-------|
| No secrets in source | **Auto** | `.env*` gitignored; use Vercel env vars for prod |
| Production secrets in Vercel | **Manual** | Never commit `app/.env`. Rotate if ever leaked. |
| Auth (Supabase) | **Present** | OAuth redirect: `{origin}/auth/callback`. Session refresh in middleware. |
| Token expiry / RBAC | **Partial** | Supabase defaults; no custom RBAC (single-user app). |
| HTTPS / SSL | **Auto** | Vercel terminates TLS; HSTS in `next.config.ts` (app + website) |
| CORS | **Present** | `app/middleware.ts` — allowlist + preview regex |
| Security headers | **Present** | CSP, HSTS, X-Frame-Options, nosniff — app + website |
| Input validation | **Present** | Zod on mutating API routes (`app/lib/validations.ts`) |
| Rate limiting | **Present** | `app/lib/rate-limit.ts` on auth bootstrap + `/api/auth/me` |
| SQL injection | **Present** | Prisma ORM only (parameterized) |
| XSS | **Present** | React escaping; email HTML escaped; CSP (note: `'unsafe-inline'` for Next.js) |
| DPDP / privacy consent | **Present** | `User.privacyConsent` + settings API |

---

## Database & Migrations

| Item | Status | Notes |
|------|--------|-------|
| Migrations backward-compatible | **Present** | Post-init migrations are additive nullable columns only |
| Run migrations before traffic | **Manual** | `npm run db:deploy` against production **before** or immediately after deploy |
| Fresh backup before deploy | **Manual** | Supabase Dashboard → Database → Backups → create snapshot / confirm PITR |
| Indexes | **Present** | See `app/prisma/schema.prisma` — user, habit, log, journal indexes |

---

## Configuration & Environments

| Item | Status | Notes |
|------|--------|-------|
| Env vars documented | **Present** | `app/.env.example`, `website/.env.example`, `DEPLOY.md` |
| Production URLs | **Manual** | `NEXT_PUBLIC_APP_URL=https://app.alavo.cc`, `NEXT_PUBLIC_PRODUCT_URL=https://app.alavo.cc` |
| Webhooks / email / SMS | **Manual** | Gmail SMTP + Supabase Auth SMTP → production accounts. Cron: external scheduler for `/api/cron/reminders` (not on Vercel Hobby cron). |
| DNS / SSL | **Manual** | Vercel auto-renews certs. Lower TTL before DNS changes. |
| Preview vs production | **Caution** | Preview deployments may share prod DB if same `DATABASE_URL` in Vercel preview env — use separate DB for staging if needed. |

---

## Observability & Monitoring

| Item | Status | Notes |
|------|--------|-------|
| Error tracking (Sentry etc.) | **Manual / Recommended** | Not installed. Add `@sentry/nextjs` for production error alerts. |
| APM / metrics alerts | **Manual** | Use Vercel Analytics + Supabase metrics; set alerts for 5xx and latency. |
| Structured logging | **Partial** | `handleApiError` logs server errors; no PII in client logs. Avoid `console.log` in routes. |
| Health checks | **Present** | App: `GET /api/health` (liveness), `GET /api/health?ready=1` (DB). Website: `GET /api/health`. Wire to uptime monitor. |

---

## Rollback & Incident Readiness

| Item | Status | Notes |
|------|--------|-------|
| Rollback plan | **Manual** | Vercel → Project → Deployments → previous deployment → **Promote to Production** (instant). |
| DB rollback | **Manual** | Migrations have no down scripts; restore from Supabase backup if needed. |
| Runbook | **Present** | See **Rollback** section in `DEPLOY.md` |
| On-call / escalation | **Manual** | Define who gets paged on 5xx spike before deploy window. |

---

## Quick pre-deploy commands

```bash
npm ci --legacy-peer-deps
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=high
npm run db:deploy   # production DB, from machine with prod DATABASE_URL
```

Then push to `master` and deploy both Vercel projects (`alavo` + `alavo-app`), or use `npx vercel deploy --prod --yes --project alavo` from repo root.

---

## Sign-off

- [ ] CI green on latest commit
- [ ] Supabase backup confirmed
- [ ] `db:deploy` applied (no pending migrations)
- [ ] Vercel production env vars verified
- [ ] Health endpoints return 200 in production
- [ ] Rollback owner identified
