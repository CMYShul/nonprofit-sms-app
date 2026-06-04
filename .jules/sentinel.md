# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-15 - Insecure Direct Object Reference (IDOR) in Contact Management
**Vulnerability:** API endpoints for fetching, updating, and deleting contacts were only using the contact ID in Prisma queries, allowing any authenticated user to manipulate any other user's contacts.
**Learning:** Prisma's `update` and `delete` methods require a unique identifier, making it difficult to enforce ownership (e.g., `where: { id, userId }`) directly without a composite unique index.
**Prevention:** Use `findFirst` for retrieval and `updateMany`/`deleteMany` for modifications when enforcing ownership, and always verify that the operation affected exactly one record.
