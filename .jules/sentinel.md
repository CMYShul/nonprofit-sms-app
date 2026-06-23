# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2026-06-23 - [IDOR Prevention with Prisma Composite Keys]
**Vulnerability:** Insecure Direct Object Reference (IDOR) allowed any authenticated user to access, modify, or delete any contact or message history by guessing or knowing the record's ID.
**Learning:** Even with authentication, endpoints must enforce ownership by scoping queries to the current user's ID. Prisma's `findUnique` requires a unique identifier, which previously was just `id`.
**Prevention:** Add a `userId` field to all user-owned models and create a composite unique index `@@unique([id, userId])`. This allows for atomic, ownership-scoped lookups using `where: { id_userId: { id, userId } }` in Prisma.
