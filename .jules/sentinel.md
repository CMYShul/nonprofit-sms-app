## 2025-05-15 - Fixing Authentication and Information Leakage
**Vulnerability:** Insecure session retrieval and sensitive data exposure in API responses.
**Learning:** In Next.js App Router, `getServerSession()` requires `authOptions` to correctly validate the session. Omitting it can lead to authentication bypass or unexpected behavior. Additionally, raw error messages from third-party APIs (like Twilio) can leak account details or internal state.
**Prevention:** Always pass `authOptions` to `getServerSession()` in API routes and sanitize error messages from external services before returning them to the client.
