# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-15 - Denial-of-Service Risk in CSV Import and broken Prisma schema sync
**Vulnerability:** The CSV contact import route lacked file size and row count limits, making it vulnerable to Denial-of-Service (DoS) attacks. Additionally, the route was attempting to write to a non-existent `userId` field, causing runtime crashes.
**Learning:** Bulk data import endpoints are primary targets for resource exhaustion attacks. Furthermore, discrepancies between API implementation and the Prisma schema (e.g., missing fields) can lead to silent failures or crashes if not caught by linting/building.
**Prevention:** Implement strict file size (1MB) and row count (100) limits for all bulk import features. Always verify API logic against the actual `schema.prisma` and ensure successful production builds to catch schema mismatches.
