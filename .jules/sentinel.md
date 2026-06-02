# Sentinel Journal

## 2025-05-11 - Information Leakage and Lack of Input Validation in SMS API
**Vulnerability:** The `/api/send-sms` endpoint was leaking raw Twilio error messages to the client and lacked any validation on the number of recipients or message length.
**Learning:** API endpoints that interface with paid third-party services (like Twilio) are high-value targets for abuse. Without input limits, they can be used for DoS or to rack up large bills.
**Prevention:** Always implement strict input validation (length, count) and return generic error messages to the client while logging details internally.

## 2025-05-14 - IDOR Vulnerability in Contacts and Messages API
**Vulnerability:** API endpoints for contacts and messages allowed any authenticated user to read, update, or delete any record in the database by ID, regardless of who created it.
**Learning:** Authentication only verifies *who* a user is; authorization must also verify *what* they are allowed to access. Resource IDs (like CUIDs) are not a substitute for access control.
**Prevention:** Always scope database queries to include the authenticated user's ID (e.g., `where: { id, userId }`). For updates and deletions, use `updateMany` or `deleteMany` and check the count of affected records to ensure the user has permission.
