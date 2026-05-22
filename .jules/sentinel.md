## 2025-05-15 - [User Isolation & Input Sanitization]
**Vulnerability:** Lack of user isolation in contact and message management, and information leakage via Twilio error messages.
**Learning:** Even if an app has authentication, if the database queries don't filter by user ID, any authenticated user can access any other user's data (IDOR).
**Prevention:** Always include ownership checks (e.g., `where: { userId: session.user.id }`) in database queries for multi-tenant applications. Sanitize third-party API error messages before returning them to the client.
