# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-20 - Insecure Direct Object Reference (IDOR) in API Routes
**Vulnerability:** API endpoints allowed authenticated users to access, update, or delete any contact or message by guessing its ID, as ownership checks were missing.
**Learning:** Prisma's `findUnique`, `update`, and `delete` only allow unique filters in the `where` clause. Enforcing ownership requires `findFirst`, `updateMany`, or `deleteMany` with a combined filter on `id` and `userId`.
**Prevention:** Always scope database queries to the authenticated user's ID. Use `updateMany` or `deleteMany` to enforce multi-field criteria and check the `count` of affected records to detect unauthorized access or non-existent resources.
