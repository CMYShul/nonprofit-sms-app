# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-13 - DoS Prevention and Schema Mismatch in CSV Import
**Vulnerability:** The `/api/contacts/import` route lacked file size and row limits, making it vulnerable to resource exhaustion (DoS). Additionally, the implementation was attempting to use a `userId` field not defined in the Prisma schema, and used inefficient individual database writes.
**Learning:** Bulk import features must always enforce multi-layered limits (file size, parsed row count) and use optimized database operations (like `createMany`) to prevent DoS. Always verify the active Prisma schema against the code to avoid data integrity issues.
**Prevention:** Enforce strict size/count limits at the API entry point and use bulk insertion for performance. Validate that all fields in the data layer match the current schema.
