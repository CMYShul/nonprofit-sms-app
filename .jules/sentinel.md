## 2026-05-16 - [Insecure Multi-Tenancy and Data Exposure]
**Vulnerability:** API routes lacked user-based scoping, allowing any authenticated user to access or modify any contact in the database. Additionally, Twilio error messages were leaked to the client, potentially exposing internal configuration details.
**Learning:** Next.js 15+ dynamic route handlers require awaiting `params`. Failing to do so can lead to unexpected behavior or build failures in newer Next.js versions.
**Prevention:** Always enforce `userId` scoping in database queries for user-owned resources. Sanitize third-party API error responses before returning them to the client.
