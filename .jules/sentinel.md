# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-12 - Insecure Direct Object Reference (IDOR) in Contacts API
**Vulnerability:** The contacts API lacked per-user scoping, allowing any authenticated user to view, edit, or delete any contact by guessing its ID.
**Learning:** Even with authentication, missing authorization checks on individual resources (ownership) creates a critical IDOR vulnerability.
**Prevention:** Always scope database queries to the authenticated user's ID. Use `updateMany` or `deleteMany` in Prisma to enforce ownership in a single atomic operation.
