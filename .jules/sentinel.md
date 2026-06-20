# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-22 - IDOR Prevention via Composite Unique Keys in Prisma
**Vulnerability:** API endpoints allowed accessing and modifying any contact by `id`, leading to Insecure Direct Object Reference (IDOR) as there was no ownership check.
**Learning:** Simply adding a `userId` field is not enough; queries must explicitly filter by it. Next.js 15+ also requires awaiting `params` in route handlers.
**Prevention:** Use `@@unique([id, userId])` in the Prisma schema to enable atomic ownership-scoped lookups with `findUnique`, `update`, and `delete`. Always await `params` before use.
