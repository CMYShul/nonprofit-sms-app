# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-14 - Insecure Direct Object Reference (IDOR) in Contacts API
**Vulnerability:** API endpoints for contacts and messages were not scoped to the authenticated user's ID, allowing any logged-in user to access or modify data belonging to others.
**Learning:** Even with authentication, authorization is critical. Prisma's `update` and `delete` methods require a unique identifier; when combined with an ownership check (like `userId`), `updateMany` and `deleteMany` are safer patterns to prevent unauthorized modifications.
**Prevention:** Always scope database queries to the `userId` from the session. Use `findFirst` instead of `findUnique` when filtering by multiple fields that aren't a composite unique key.
