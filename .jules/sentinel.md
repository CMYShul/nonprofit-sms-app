# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-12 - Denial-of-Service and Resource Exhaustion in Bulk Import
**Vulnerability:** The CSV import endpoint lacked file size and row limits, and used individual database inserts for each record, making it vulnerable to resource exhaustion and DoS.
**Learning:** Bulk operations are primary vectors for DoS attacks. Without limits on the input size (file size and row count) and efficient database operations (like `createMany`), a single request can degrade system performance or crash the database.
**Prevention:** Enforce strict file size and row count limits on all batch/import endpoints. Use bulk database operations to minimize round-trips and resource locking.
