# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-15 - Insecure Direct Object Reference (IDOR) in Contacts API
**Vulnerability:** The contacts API endpoints (`/api/contacts/[id]`) allowed any authenticated user to GET, UPDATE, or DELETE any contact by simply knowing its ID, as there was no ownership check.
**Learning:** Authentication is not authorization. Verifying that a user is logged in is insufficient; every request for a specific resource must verify that the authenticated user actually owns that resource.
**Prevention:** Use composite unique indices (e.g., `id_userId`) in the database schema to facilitate atomic ownership-scoped operations, and always include the user ID in query filters.
