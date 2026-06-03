# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-12 - Broken Object Level Authorization (BOLA) and Multi-tenancy
**Vulnerability:** All API endpoints (`/api/contacts`, `/api/messages`, `/api/send-sms`) lacked ownership checks, allowing any authenticated user to access or modify data belonging to others (IDOR/BOLA).
**Learning:** In a multi-user application, authentication is not enough; authorization must be enforced at the data layer. Prisma's `update` and `delete` methods only support unique identifiers; for ownership checks in a single query, `updateMany` and `deleteMany` are required.
**Prevention:** Use a `userId` field to isolate data and always include it in the `where` clause of every database query. Check the `count` returned by `updateMany`/`deleteMany` to distinguish between 'not found' and 'unauthorized'.
