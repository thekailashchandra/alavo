# Changelog

## Unreleased

### Added

- `CLOUD_PAID_SIGNUP_DATE` marks when new Alavo Cloud accounts must pay. When it is unset, current Cloud rules stay in place.
- New unpaid Cloud accounts see a paywall and can check out with the existing Razorpay monthly plan.
- `DEPLOYMENT_MODE=self-hosted` unlocks the full core habit tracker and skips Cloud checkout.
- Open-source project docs: license notes, contributing, security, conduct, privacy, and roadmap.
- AGPL-3.0 license notice.

### Changed

- README now describes self-hosting and Alavo Cloud as separate choices.
- Default deployment mode remains `cloud`, so existing hosted billing behavior is unchanged.

### Fixed

### Security

- Razorpay fulfillment claims a payment once and ignores SKU overrides in webhook notes.
- Team invite attempts are rate limited. New unpaid Cloud accounts cannot join a group to bypass payment.
- Self-hosted mode does not call Razorpay checkout or coupon redemption.
