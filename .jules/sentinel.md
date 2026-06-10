# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-12 - Insecure Direct Object Reference (IDOR) in CRUD operations
**Vulnerability:** API endpoints for individual resources (e.g., `/api/contacts/[id]`) were fetching and modifying records based solely on the resource ID, allowing authenticated users to access or delete other users' data.
**Learning:** Next.js route parameters (`params`) must be awaited in version 15+, and Prisma's `update`/`delete` methods require unique identifiers. When enforcing ownership without composite unique constraints, `updateMany` and `deleteMany` are necessary to safely filter by `userId`.
**Prevention:** Always scope database queries to the authenticated user's ID. Use `findFirst` for retrieval and `updateMany`/`deleteMany` (checking the `count` property) for modifications when a composite unique index is not available.
