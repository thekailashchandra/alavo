# Alavo

> The beautiful, privacy-first, open-source habit tracker.

Your habits. Your data. Your choice.

Alavo is a habit tracker you can run yourself, or let Alavo host for you. The software is free. The managed cloud service is paid.

- **Self-hosted** — full core app, your database, your server. Free forever.
- **Alavo Cloud** — managed hosting, backups, updates, and support. Paid only. There is no permanent free hosted tier.

Live site: [https://alavo.cc](https://alavo.cc)

## Features

- Daily habits, streaks, and completion history
- Journal
- Analytics and heatmaps
- Reminders and web push
- JSON data export and account deletion
- Installable PWA
- Optional team groups on Alavo Cloud plans that include them

Screenshots and a hosted demo will be added as the public repository is prepared. Until then, run the app locally.

## Is Alavo free?

Yes. Alavo is free and open source when you self-host it.

## Is Alavo Cloud free?

No. Alavo Cloud is a paid managed hosting service. Accounts that already existed before the Cloud monetization date keep the access they have today. New hosted accounts need a paid plan.

Alavo Cloud exists to pay for infrastructure, the database, updates, reminders, maintenance, and support. The source code stays open.

## Self-host

Self-hosting does not require an Alavo account, a Stripe account, or a license server.

Today the app still uses **your own** Supabase project for authentication and Postgres. That is your infrastructure, not Alavo Cloud. A single `docker compose up` that includes auth is not finished yet. See [docs/self-hosting/README.md](docs/self-hosting/README.md).

```bash
npm install --legacy-peer-deps
cp app/.env.example app/.env
# set DEPLOYMENT_MODE=self-hosted and your own database + Supabase keys
npm run db:migrate
npm run dev:app
```

App: http://localhost:3000  
Marketing site: `npm run dev:website` → http://localhost:3001

## Alavo Cloud

Pay for convenience: hosting, backups, updates, notifications, and support. You do not pay to unlock the open-source software.

Current hosted billing is Razorpay payment links (time-boxed Pro, yearly, and lifetime), not Stripe subscriptions. Existing customers keep the access they purchased. The target cloud model is documented in [docs/architecture/migration.md](docs/architecture/migration.md) and is **not** fully switched on yet.

## Pricing

| | Self-hosted | Alavo Cloud |
|---|---|---|
| Price | Free | Paid |
| Core habit tracker | Yes | Yes |
| Your database | Yes | Managed |
| Billing | Not used | Required for new hosted access (planned) |

Official Cloud prices are not changed in this step. Existing catalog defaults remain ₹199 / $5 monthly, ₹999 / $30 yearly, and ₹2999 / $99 lifetime.

## Privacy

Habit names, notes, and journal text stay in your database. Analytics on the marketing site must not receive that content. Details: [docs/privacy.md](docs/privacy.md).

## Development

| Command | What it does |
|---|---|
| `npm run dev:app` | Product app on port 3000 |
| `npm run dev:website` | Marketing site on port 3001 |
| `npm run lint` | Lint workspaces |
| `npm run typecheck` | Typecheck workspaces |
| `npm run test` | App unit tests |
| `npm run build` | Production build |
| `npm run db:migrate` | Prisma migrate (app) |

Node.js 20 or newer. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Repository layout

```text
app/             Product PWA
website/         Marketing site
packages/brand   Shared brand and pricing catalog
packages/tsconfig
docs/            Self-hosting, architecture, privacy
```

## Contributing

Issues, discussions, and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Security reports: [SECURITY.md](SECURITY.md).

## Roadmap

See [docs/roadmap.md](docs/roadmap.md). The roadmap is not a promise that unfinished features are available.

## License

[AGPL-3.0-only](LICENSE). This is a product decision, not legal advice. See [docs/license.md](docs/license.md).
