# Deploy Alavo to Vercel

Two **separate** Vercel projects from the same GitHub repo.

---

## Project A — Product (`app.alavo.cc`)

### Import
1. https://vercel.com/new → Import `thekailashchandra/alavo`

### Configure (before Deploy)
| Setting | Value |
|---------|--------|
| **Root Directory** | `app` ← click Edit, select the `app` folder |
| **Framework** | Next.js (auto) |
| **Install Command** | `npm install --legacy-peer-deps --prefix=..` |
| **Build Command** | `npm run build` |
| **Output Directory** | *(leave default — `.next`)* |

> Turn **ON**: *Include source files outside of the Root Directory in the Build Step*  
> (Project Settings → General → Root Directory section)

### Environment variables
Copy from `app/.env`. Required:

```
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://app.alavo.cc
CRON_SECRET=
GMAIL_USER=
GMAIL_APP_PASSWORD=
EMAIL_FROM=Alavo <hi@alavo.cc>
EMAIL_REPLY_TO=hi@alavo.cc
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT_EMAIL=mailto:hi@alavo.cc
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

### Domain
Settings → Domains → add `app.alavo.cc`

---

## Project B — Marketing (`alavo.cc`)

### Import
1. https://vercel.com/new → Import the **same repo again**

### Configure
| Setting | Value |
|---------|--------|
| **Root Directory** | `website` |
| **Install Command** | `npm install --legacy-peer-deps --prefix=..` |
| **Build Command** | `npm run build` |

Enable *Include source files outside of the Root Directory* (same as above).

### Environment variable
```
NEXT_PUBLIC_PRODUCT_URL=https://app.alavo.cc
```

### Domain
Settings → Domains → add `alavo.cc` and `www.alavo.cc`

---

## DNS (at your domain registrar)

After adding domains in Vercel, use the records Vercel shows. Usually:

| Type | Name | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `app` | `cname.vercel-dns.com` |

---

## Neon Auth (after deploy)

Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://app.alavo.cc`
- Redirect URLs: `https://app.alavo.cc/auth/callback`, `http://localhost:3000/auth/callback`
- Trusted domains: `alavo.cc`, `app.alavo.cc`

Supabase → Auth → SMTP: Gmail (`smtp.gmail.com`, port 465) for signup OTP.

---

## Health checks (after deploy)

| Service | Liveness | Readiness (DB) |
|---------|----------|----------------|
| App | `GET https://app.alavo.cc/api/health` | `GET https://app.alavo.cc/api/health?ready=1` |
| Website | `GET https://alavo.cc/api/health` | — |

Wire these to your uptime monitor (Better Uptime, UptimeRobot, etc.).

---

## Rollback

1. **App or website (instant):** Vercel → project → Deployments → select previous green deployment → **Promote to Production**.
2. **Database:** Migrations are forward-only. If a migration caused issues, restore from Supabase backup (Dashboard → Database → Backups) — do **not** run `migrate reset` on production.
3. **Pre-deploy checklist:** See `PRE-DEPLOY.md`.

---

## Troubleshooting

**`ENOENT package.json`**  
→ Root Directory is wrong. Must be `app` or `website`, not repo root and not `app/app`.

**Peer dependency errors**  
→ Install command must include `--legacy-peer-deps`.

**`@alavo/brand` not found**  
→ Enable *Include source files outside of the Root Directory* and use `--prefix=..` install.
