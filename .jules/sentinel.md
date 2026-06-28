# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-12 - Denial-of-Service and Resource Exhaustion in CSV Import
**Vulnerability:** The CSV contact import route lacked file size and row limits, making it vulnerable to resource exhaustion (DoS). It also lacked field truncation and had a bug where it tried to use a non-existent `userId` field.
**Learning:** Large file uploads and unconstrained parsing can quickly saturate server memory and CPU. Proper input limits and field truncation are essential for any bulk upload feature.
**Prevention:** Enforce strict file size (e.g., 1MB) and row (e.g., 100) limits on all bulk upload endpoints. Truncate fields to their database schema limits before insertion.
