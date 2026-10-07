# Security policy

## Supported versions

Security fixes are applied to the current main branch. There are no older packaged releases yet.

## Reporting a vulnerability

Email the maintainers with:

- a short description
- the affected route or file, if you know it
- steps to reproduce
- the impact

Do not open a public issue for an unfixed vulnerability. Do not include live secrets, access tokens, or other people's habit data.

Please allow time for a fix before publishing details.

## Self-hosters

You operate your own database, Supabase project, SMTP, and server. You are responsible for:

- keeping dependencies updated
- restricting `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` to the server
- using HTTPS in production
- taking your own backups

Alavo Cloud's operational responsibilities do not apply to a self-hosted install.

## Expectations

- Do not commit `.env` files.
- Protected data access must check the signed-in user on the server.
- Payment state must be confirmed on the server, not trusted from the browser.
