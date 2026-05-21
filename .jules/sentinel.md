## 2026-05-21 - [Broken Access Control in Contacts API]
**Vulnerability:** Insecure Direct Object Reference (IDOR) and Broken Access Control. Any authenticated user could access, update, or delete any contact in the database because the `Contact` model lacked a `userId` field and API routes did not filter by owner.
**Learning:** The application was initially designed with a shared database for all users. Adding multi-tenancy requires schema changes (`userId`) and consistent enforcement across all CRUD and import endpoints.
**Prevention:** Always include owner identifiers in multi-tenant data models and use `where: { id, userId }` filters in all data access logic. For `PUT`/`DELETE`, use `updateMany`/`deleteMany` to safely handle authorization and 'not found' cases in a single operation.
