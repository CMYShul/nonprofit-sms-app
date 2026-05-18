## 2025-05-15 - [Consistent Authentication Validation]
**Vulnerability:** Inconsistent session validation in API routes.
**Learning:** Using `getServerSession()` without `authOptions` in NextAuth v4 API routes can lead to inconsistent session retrieval, especially when custom session strategies or JWT callbacks are used.
**Prevention:** Always pass `authOptions` to `getServerSession(authOptions)` in Route Handlers to ensure the session is validated against the application's specific security configuration.

## 2025-05-15 - [Information Leakage from Third-Party APIs]
**Vulnerability:** Leaking Twilio error details to the client.
**Learning:** Returning raw error messages from external service providers (like Twilio) can expose internal configuration details, account information, or API behavior to potential attackers.
**Prevention:** Sanitize error responses from third-party APIs by returning generic error messages to the client while logging the detailed error server-side for debugging.
