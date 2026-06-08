# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-15 - Missing Data Isolation and IDOR Vulnerabilities
**Vulnerability:** The application lacked data isolation, allowing any authenticated user to view, modify, or delete any contact or message record via direct object references (IDOR).
**Learning:** Even with authentication in place, authorization (ownership checks) is critical. Next.js 16 Route Handlers also require awaiting `params` to avoid potential runtime issues or security bypasses in dynamic routes.
**Prevention:** Include `userId` fields in all user-owned data models and enforce ownership in every database query using `where: { id, userId: session.user.id }`. Use `updateMany` and `deleteMany` to safely handle authorization and existence in a single operation.
