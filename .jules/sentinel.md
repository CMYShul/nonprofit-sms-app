# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2026-06-21 - [IDOR Prevention and Import Security]
**Vulnerability:** API endpoints were missing ownership checks (IDOR) and CSV imports lacked size/row limits (DoS risk).
**Learning:** Even with authentication, each data access/mutation must be scoped to the authenticated user to prevent users from accessing others' data.
**Prevention:** Use composite unique indexes (e.g., id + userId) for atomic ownership-scoped lookups in Prisma, and always enforce strict limits on file uploads and batch processing.
