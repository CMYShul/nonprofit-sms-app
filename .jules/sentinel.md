# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-12 - Ghost Fields and Resource Exhaustion in CSV Import
**Vulnerability:** The CSV contact import route was susceptible to DoS via large file uploads and resource exhaustion through unbounded row processing. It also contained a "ghost field" (`userId`) in its Prisma calls that did not exist in the database schema, which would cause runtime failures.
**Learning:** Bulk import features are prime candidates for DoS. Always enforce file size and row limits. Additionally, legacy or copy-pasted code might reference schema fields that don't exist, leading to silent or loud failures.
**Prevention:** Implement strict `multipart/form-data` size limits and row processing caps. Use `createMany` for efficient bulk operations. Always verify that API implementation matches the Prisma schema.
