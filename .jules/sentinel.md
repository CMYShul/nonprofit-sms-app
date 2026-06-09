# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-14 - IDOR and Prisma findUnique Constraints
**Vulnerability:** Lack of data isolation allowed users to access/modify any contact by ID (IDOR).
**Learning:** Prisma's `findUnique` strictly requires fields used in the `where` clause to be unique identifiers (PK or `@unique`). Combining `id` and `userId` without a composite unique index causes a runtime error.
**Prevention:** Use `findFirst` when filtering by non-unique combinations of fields (like `id` and `userId`), or define a composite unique index in `schema.prisma`.
