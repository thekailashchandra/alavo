# Privacy

Your habits. Your data. Your choice.

## Principles

- Alavo does not sell personal data.
- Habit names, notes, and journal entries are private content.
- Product analytics must not receive habit names, journal text, or private notes.
- You can export your data as JSON and delete your account from Settings.

## Self-hosted

You run the database and the auth project. Alavo Cloud does not receive your habit data unless you configure an integration that sends it somewhere. Backups, retention, and access control are yours.

Set `DEPLOYMENT_MODE=self-hosted`. Razorpay is not required.

## Alavo Cloud

The hosted service stores account and habit data so the product can run: habits, completions, journal entries, settings, and billing records. Passwords are handled by Supabase Auth, not stored as reusable password hashes in the app database.

Payment card data is handled by the payment provider (Razorpay today). Alavo stores payment status, amount, currency, and provider ids.

## Export and deletion

JSON export includes profile, habits, logs, and journal entries. It must not include password hashes or server secrets.

Account deletion removes the application user and the related auth user. Export first if you want a copy.

## Marketing analytics

The marketing site can load Google Analytics and Umami. Those tools see site visits, not the contents of your habit journal. The product app should not send habit content to them.
