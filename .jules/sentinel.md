# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-12 - Bulk Data Import Hardening and Schema Alignment
**Vulnerability:** The CSV import route lacked file size and row limits, and attempted to write to a non-existent `userId` field in the Prisma schema.
**Learning:** Bulk import features are prime targets for DoS via large files. Additionally, inconsistencies between application logic and the database schema (like `userId`) cause silent failures or runtime errors.
**Prevention:** Enforce strict file size (1MB) and row limits (100) for all bulk operations. Always verify Prisma schema fields before implementing DB operations.
