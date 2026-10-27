# Security review checklist

This branch is for review only. Do not deploy or merge until build and regression tests pass.

## Confirmed limitations

- Live payment processing is not implemented. Production payment initialization still needs to be disabled or replaced with verified provider integration.
- Production payment verification and webhooks are blocked on this branch.
- Payment webhook HMAC verification requires provider-specific validation of the original raw request body before any production use.
- Development demo data is opt-in via `SEED_DEMO_DATA=true`; never enable this against a live database.
- Configure `JWT_SECRET` with a securely generated value of at least 32 characters and `CORS_ORIGIN` with approved origins.

## Required tests

1. Reject attempts to self-register as `SUPER_ADMIN`, `ADMIN`, or staff roles.
2. Verify legitimate customer, farmer, and logistics registration.
3. Reject payment initialization and verification for another user's order or payment.
4. Reject invalid webhook signatures and unknown payment references.
5. Confirm no simulated payment can mark an order paid in production.
6. Confirm production startup never creates demonstration users.
7. Verify the client and server builds, tests, and deployment configuration.

Do not use real customer payments until the live provider integration and end-to-end reconciliation are independently tested.
