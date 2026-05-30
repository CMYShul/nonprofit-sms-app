# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-12 - Resource Exhaustion and Data Model Mismatch
**Vulnerability:** Bulk operations (import and SMS sending) lacked any upper bounds on the number of items processed, creating a Denial of Service (DoS) risk and potential for excessive billing. Additionally, the import logic was attempting to use a `userId` field that did not exist in the Prisma schema, which would cause a crash.
**Learning:** In Next.js 16, `params` in route handlers is a Promise and must be awaited. Failing to do so results in runtime errors that can be mistaken for other issues. Also, never assume the database schema supports multi-tenancy (like `userId`) without checking `schema.prisma`.
**Prevention:** Implement hard limits on all bulk API endpoints. Always verify the database schema before implementing ownership-based logic. Ensure `params` is awaited in Next.js 16 route handlers.
