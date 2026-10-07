# Cloud access

`CLOUD_PAID_SIGNUP_DATE` is the only cutoff. If it is missing or not a valid date, every Cloud account keeps the current rules.

An account is grandfathered when `user.createdAt` is earlier than that cutoff. Plan, trial, and payment status are not used to decide this.

## Who can open the hosted app

- Self-hosted (`DEPLOYMENT_MODE=self-hosted`): always. Razorpay is not required.
- Grandfathered Cloud accounts: always, with their existing limits. Free accounts still have 5 active habits and 30-day analytics history. Trials, Pro time, and lifetime flags are unchanged.
- Newer Cloud accounts: only with an active paid plan or a lifetime unlock. They do not receive the old 14-day trial.

Billing, account, export, and auth routes stay available so a new user can pay, export, or delete the account.

## Team seats

Joining a group does not rewrite the member's plan. If the group owner has an active Team plan, members who can already open the workspace still receive that shared seat. That behavior is unchanged for grandfathered accounts.

An invite code does not unlock Alavo Cloud for a new unpaid account. The join route is a workspace API, and those calls are rejected until the account has a paid plan. Join attempts are also rate limited.

## Export

JSON export returns the person's own habits, logs, and journal. The 30-day analytics cap is a viewing limit for grandfathered free Cloud users. It is not applied to export. New unpaid Cloud users can still export.
