# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2026-06-18 - Lack of Data Isolation (IDOR) and Global Record Access
**Vulnerability:** API routes for contacts and messages were fetching and modifying records without checking ownership, allowing any authenticated user to access or delete other users' data (IDOR).
**Learning:** Defaulting to global queries is a common security pitfall in multi-user applications. Authentication alone is insufficient; every database operation must be explicitly scoped to the authenticated user's ID.
**Prevention:** Enforce data isolation at the schema level (e.g., adding a `userId` field) and always include ownership checks in Prisma queries (`where: { id, userId }`).
