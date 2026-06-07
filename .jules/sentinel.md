# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2026-06-07 - IDOR and Next.js 16 Compatibility in API Routes
**Vulnerability:** Contact API endpoints allowed any authenticated user to access, update, or delete any contact by ID (IDOR) due to missing ownership checks.
**Learning:** In Next.js 16, `params` in Route Handlers is a Promise and must be awaited. Failing to do so can lead to logic errors where `id` is undefined. Using `updateMany` and `deleteMany` with a `userId` filter is a safer way to enforce ownership in Prisma than `update`/`delete`.
**Prevention:** Always scope database queries to the authenticated user's ID and ensure all framework-specific requirements (like awaiting `params`) are met.
