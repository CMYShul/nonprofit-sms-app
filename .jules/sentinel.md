# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2026-07-07 - CSV Import Vulnerabilities and DoS Risks
**Vulnerability:** The CSV contact import endpoint lacked file size limits, row count limits, and string length validation, making it vulnerable to Denial-of-Service (DoS) and potential buffer/data overflow issues.
**Learning:** Bulk data import features are primary vectors for resource exhaustion. Next.js 16 and Turbopack enforce stricter build-time checks, requiring clean ESLint and proper async handling for route parameters.
**Prevention:** Implement multi-layered resource limits (file size, row count, field length) and use optimized database operations (like `createMany`) for bulk tasks.
